import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, update, set, runTransaction } from 'firebase/database';
import { tasks, Task } from '../data/tasks';

interface FirebaseTask {
  completed: boolean;
  lastCompleted?: string | null;
  todayCompleted?: string | null;
}

interface FirebaseDailyTasks {
  morning: { [task_id: string]: boolean };
  afternoon: { [task_id: string]: boolean };
  weekly: { [task_id: string]: FirebaseTask };
}

// Helper: lấy ngày dưới định dạng YYYYMMDD theo local timezone (không dùng toISOString())
const getLocalYYYYMMDD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${dd}`; // ex: "20250809"
};

// Helper: parse YYYYMMDD -> Date hoặc null
const parseYYYYMMDD = (s?: string | null): Date | null => {
  if (!s) return null;
  const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

// Helper: đọc giá trị completed từ nhiều shape (boolean | {completed: boolean} | undefined)
const readCompletionValue = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  if (typeof val === 'object' && 'completed' in val) return !!val.completed;
  return !!val;
};

const DailyTasksPage: React.FC = () => {
  const [firebaseTasks, setFirebaseTasks] = useState<FirebaseDailyTasks>({
    morning: {},
    afternoon: {},
    weekly: {},
  });

  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'weekly'>('morning');
  const [todayStr, setTodayStr] = useState(() => getLocalYYYYMMDD());

  // Cập nhật todayStr mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getLocalYYYYMMDD();
      setTodayStr(prev => (prev !== newToday ? newToday : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Effect: listen daily (morning/afternoon)
  useEffect(() => {
    const dailyRef = ref(db, `tasks_data/daily`);
    const unsubscribe = onValue(dailyRef, (snapshot) => {
      const data = snapshot.val();
      // ensure fallback shapes
      setFirebaseTasks(prev => ({
        ...prev,
        morning: data?.morning || {},
        afternoon: data?.afternoon || {},
      }));
    });

    return () => unsubscribe();
  }, []);

useEffect(() => {
  const weeklyRef = ref(db, `tasks_data/weekly`);
  const unsubscribe = onValue(weeklyRef, (snapshot) => {
    const data = snapshot.val();
    const today = getLocalYYYYMMDD();
    const todayDate = new Date();

    if (!data) {
      // initialize weekly if empty
      const initialWeekly = tasks
        .filter(t => t.section === 'weekly')
        .reduce((acc, t) => ({
          ...acc,
          [t.id]: { completed: false, lastCompleted: null, todayCompleted: null }
        }), {} as Record<string, FirebaseTask>);
      set(weeklyRef, initialWeekly).catch(err => console.error('init weekly failed', err));
      setFirebaseTasks(prev => ({ ...prev, weekly: initialWeekly }));
      return;
    }

    const updatedWeekly = { ...data } as Record<string, FirebaseTask>;
    const multiUpdates: Record<string, any> = {};

    Object.entries(updatedWeekly).forEach(([taskId, task]) => {
      if (!task) return;

      const taskInfo = tasks.find(t => t.id === taskId);
      if (!taskInfo?.frequency) return; // Không có frequency thì bỏ qua

      const lastDoneDate = parseYYYYMMDD(task.todayCompleted);
      if (!lastDoneDate) return; // Chưa hoàn thành lần nào thì không reset

      // Tính ngày đến hạn
      const dueDate = new Date(lastDoneDate.getTime() + taskInfo.frequency * 24 * 60 * 60 * 1000);

      // Nếu hôm nay >= ngày đến hạn => reset
      if (todayDate >= dueDate && task.completed) {
        const newVal: FirebaseTask = {
          ...task,
          completed: false,
          lastCompleted: task.todayCompleted,
          todayCompleted: null,
        };
        updatedWeekly[taskId] = newVal;
        multiUpdates[`tasks_data/weekly/${taskId}`] = newVal;
      }
    });

    if (Object.keys(multiUpdates).length > 0) {
      update(ref(db), multiUpdates).catch(err => console.error('batch update weekly failed', err));
    }

    setFirebaseTasks(prev => ({ ...prev, weekly: updatedWeekly }));
  });

  return () => unsubscribe();
}, [todayStr]);


  // Tạo dữ liệu daily ban đầu
  const handleCreateNewDailyData = async () => {
    const dailyRef = ref(db, `tasks_data/daily`);
    const initialDaily = {
      morning: tasks.filter(t => t.section === 'morning').reduce((acc, t) => ({ ...acc, [t.id]: false }), {} as Record<string, boolean>),
      afternoon: tasks.filter(t => t.section === 'afternoon').reduce((acc, t) => ({ ...acc, [t.id]: false }), {} as Record<string, boolean>),
    };
    try {
      await set(dailyRef, initialDaily);
      setFirebaseTasks(prev => ({ ...prev, morning: initialDaily.morning, afternoon: initialDaily.afternoon }));
    } catch (err) {
      console.error('set initial daily failed', err);
    }
  };

  // Toggle completion: uses set for daily (boolean) and transaction for weekly (atomic)
  const handleCompleteTask = async (
    section: 'morning' | 'afternoon' | 'weekly',
    taskId: string,
    completed: boolean
  ) => {
    if (section === 'weekly') {
      const taskRef = ref(db, `tasks_data/weekly/${taskId}`);
      try {
        await runTransaction(taskRef, (current) => {
          const today = getLocalYYYYMMDD();
          // If no current, create initial structure
          if (!current) {
            return {
              completed: !!completed,
              lastCompleted: null,
              todayCompleted: completed ? today : null,
            };
          }

          if (completed) {
            // Mark completed today. Move prev todayCompleted to lastCompleted if it's a different day
            const prevToday = current.todayCompleted || null;
            const newLast = prevToday && prevToday !== today ? prevToday : current.lastCompleted || null;
            return {
              ...current,
              completed: true,
              lastCompleted: newLast,
              todayCompleted: today,
            };
          } else {
            // Uncheck: move today's mark into lastCompleted and clear todayCompleted
            return {
              ...current,
              completed: false,
              lastCompleted: current.todayCompleted || current.lastCompleted || null,
              todayCompleted: null,
            };
          }
        });
      } catch (err) {
        console.error('Failed to toggle weekly task', err);
      }
    } else {
      // For daily, store boolean (not object)
      try {
        await set(ref(db, `tasks_data/daily/${section}/${taskId}`), completed);
      } catch (err) {
        console.error('Failed to write daily completion', err);
      }
    }
  };

  const shouldDisplayWeeklyTask = (task: Task, today: Date): boolean => {
    return !!task.frequency; // giữ logic cũ — bạn có thể mở rộng theo business rules
  };

  const getNextDueDate = (task: Task, today: Date): string => {
    if (!task.frequency) return '';
    const lastCompleted = firebaseTasks.weekly[task.id]?.lastCompleted;
    const startDate = parseYYYYMMDD(lastCompleted) ?? today;
    const frequencyDays = Math.max(1, Math.ceil(Number(task.frequency) || 0));
    const nextDue = new Date(startDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
    return nextDue.toLocaleDateString('vi-VN');
  };

  const getDisplayedTasks = (section: 'morning' | 'afternoon' | 'weekly'): Task[] => {
    const today = new Date();
    const sectionTasks = tasks.filter((task) => task.section === section);
    const filteredTasks = section === 'weekly' ? sectionTasks.filter((task) => shouldDisplayWeeklyTask(task, today)) : sectionTasks;
    return filteredTasks.sort((a, b) => {
      const aCompleted = section === 'weekly'
        ? !!firebaseTasks[section][a.id]?.completed
        : readCompletionValue(firebaseTasks[section][a.id]);
      const bCompleted = section === 'weekly'
        ? !!firebaseTasks[section][b.id]?.completed
        : readCompletionValue(firebaseTasks[section][b.id]);
      // Tasks chưa hoàn thành nên hiển thị trước
      return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1;
    });
  };

  const getPendingTasksCount = (section: 'morning' | 'afternoon' | 'weekly'): number => {
    const sectionTasks = getDisplayedTasks(section);
    return sectionTasks.filter((task) => !(section === 'weekly' ? firebaseTasks[section][task.id]?.completed : readCompletionValue(firebaseTasks[section][task.id]))).length;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #d1d5db;
            border-radius: 9999px;
            background-color: white;
            cursor: pointer;
            outline: none;
          }
          input[type="checkbox"]:checked {
            background-color: white;
            border-color: #1f2937;
          }
          input[type="checkbox"]:checked::after {
            content: '✔';
            display: block;
            text-align: center;
            color: black;
            font-size: 12px;
            line-height: 12px;
          }
          input[type="checkbox"]:focus {
            ring: 2px solid #3b82f6;
          }
        `}
      </style>

      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Danh Sách Công Việc Hàng Ngày</h1>

        <div className="flex gap-2 mb-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={handleCreateNewDailyData}
          >
            Tạo mới dữ liệu
          </button>

        </div>

        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center text-sm sm:text-base font-semibold ${
              activeTab === 'morning'
                ? 'bg-blue-700 text-white border-b-2 border-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition rounded-t-lg`}
            onClick={() => setActiveTab('morning')}
          >
            Ca Sáng ({getPendingTasksCount('morning')})
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm sm:text-base font-semibold ${
              activeTab === 'afternoon'
                ? 'bg-blue-700 text-white border-b-2 border-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition rounded-t-lg`}
            onClick={() => setActiveTab('afternoon')}
          >
            Ca Chiều ({getPendingTasksCount('afternoon')})
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm sm:text-base font-semibold ${
              activeTab === 'weekly'
                ? 'bg-blue-700 text-white border-b-2 border-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition rounded-t-lg`}
            onClick={() => setActiveTab('weekly')}
          >
            Định Kỳ ({getPendingTasksCount('weekly')})
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          {activeTab === 'morning' ? 'Công Việc Ca Sáng' : activeTab === 'afternoon' ? 'Công Việc Ca Chiều' : 'Công Việc Định Kỳ'}
        </h2>

        {getDisplayedTasks(activeTab).length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            {activeTab === 'weekly' ? 'Hôm nay không có công việc định kỳ.' : 'Chưa có công việc nào.'}
          </p>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="text-sm">
              {getDisplayedTasks(activeTab).map((task, index) => (
                <div
                  key={task.id}
                  onClick={() =>
                    handleCompleteTask(
                      activeTab,
                      task.id,
                      !(activeTab === 'weekly'
                        ? (!!firebaseTasks[activeTab][task.id]?.completed)
                        : readCompletionValue(firebaseTasks[activeTab][task.id]))
                    )
                  }
                  className={`flex items-center space-x-2 p-2 border rounded-lg mb-2 hover:bg-gray-100 transition cursor-pointer ${
                    (activeTab === 'weekly'
                      ? firebaseTasks[activeTab][task.id]?.completed
                      : readCompletionValue(firebaseTasks[activeTab][task.id]))
                      ? 'line-through text-gray-500'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      activeTab === 'weekly'
                        ? !!firebaseTasks[activeTab][task.id]?.completed
                        : readCompletionValue(firebaseTasks[activeTab][task.id])
                    }
                    onChange={(e) => handleCompleteTask(activeTab, task.id, e.target.checked)}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {index + 1}. {task.description}
                      {activeTab === 'weekly' && (
                        <span className="ml-2 text-xs text-red-500">
                          {firebaseTasks.weekly[task.id]?.completed
                            ? `[Hoàn thành ${firebaseTasks.weekly[task.id]?.todayCompleted?.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}, làm lại vào ${getNextDueDate(task, new Date())}]`
                            : firebaseTasks.weekly[task.id]?.todayCompleted
                            ? `[Hủy hoàn thành ${firebaseTasks.weekly[task.id]?.todayCompleted?.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}]`
                            : '[Cần làm hôm nay]'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasksPage;
