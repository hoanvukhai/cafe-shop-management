import React from 'react';
import { Line } from 'react-chartjs-2';

interface Order {
  created_at: string;
  order_status: string;
}

interface TasksTabProps {
  tasksData: any;
  orders: Order[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const TasksTab: React.FC<TasksTabProps> = ({ tasksData, orders, filterType, filterDate }) => {
  const getTaskCompletionData = () => {
    let timeRange: string[] = [];
    if (filterType === 'day') {
      timeRange = [filterDate];
    } else if (filterType === 'week') {
      timeRange = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        date.setDate(date.getDate() - date.getDay() + i);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else if (filterType === 'month') {
      const [year, month] = filterDate.match(/(\d{4})(\d{2})/)!.slice(1);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      timeRange = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(`${year}-${month}-${(i + 1).toString().padStart(2, '0')}`);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else {
      timeRange = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(Number(filterDate.slice(0, 4)), i, 1);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      });
    }

    const completionData = timeRange.map((time) => {
      let completed = 0;
      let total = 0;
      ['morning', 'afternoon', 'weekly'].forEach((section) => {
        Object.entries(tasksData[section === 'weekly' ? 'weekly' : 'daily'][section] || {}).forEach(([taskId, status]) => {
          if (section === 'weekly') {
            const task = tasksData.weekly[taskId];
            if (task.todayCompleted === time || (filterType === 'year' && task.todayCompleted?.startsWith(time))) {
              if (task.completed) completed++;
              total++;
            }
          } else {
            if ((status && time === filterDate) || (filterType === 'year' && time.startsWith(filterDate.slice(0, 4)))) {
              if (status) completed++;
              total++;
            }
          }
        });
      });
      return total ? (completed / total) * 100 : 0;
    });

    return {
      labels: filterType === 'year' ? timeRange.map((t) => t.slice(4, 6)) : timeRange.map((t) => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: [{
        label: 'Tỷ lệ hoàn thành (%)',
        data: completionData,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      }],
    };
  };

  const getOrderCompletionRate = () => {
    let timeRange: string[] = [];
    if (filterType === 'day') {
      timeRange = [filterDate];
    } else if (filterType === 'week') {
      timeRange = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        date.setDate(date.getDate() - date.getDay() + i);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else if (filterType === 'month') {
      const [year, month] = filterDate.match(/(\d{4})(\d{2})/)!.slice(1);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      timeRange = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(`${year}-${month}-${(i + 1).toString().padStart(2, '0')}`);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else {
      timeRange = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(Number(filterDate.slice(0, 4)), i, 1);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      });
    }

    const completionRates = timeRange.map((time) => {
      const filteredOrders = orders.filter((order) => {
        const orderDate = order.created_at.slice(0, 10).replace(/-/g, '');
        if (filterType === 'year') return orderDate.startsWith(time);
        return orderDate === time;
      });
      const total = filteredOrders.length;
      const completed = filteredOrders.filter((order) => order.order_status === 'completed').length;
      return total ? (completed / total) * 100 : 0;
    });

    return {
      labels: filterType === 'year' ? timeRange.map((t) => t.slice(4, 6)) : timeRange.map((t) => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: [{
        label: 'Tỷ lệ đơn hoàn thành (%)',
        data: completionRates,
        fill: false,
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.1,
      }],
    };
  };

  const taskCompletionData = getTaskCompletionData();
  const orderCompletionRate = getOrderCompletionRate();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tỷ Lệ Hoàn Thành Công Việc</h2>
      {taskCompletionData.datasets[0].data.every((d) => d === 0) ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <Line data={taskCompletionData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
      <h3 className="text-lg font-medium mb-2 mt-6">Tỷ Lệ Đơn Hoàn Thành</h3>
      {orderCompletionRate.datasets[0].data.every((d) => d === 0) ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <Line data={orderCompletionRate} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
};

export default TasksTab;