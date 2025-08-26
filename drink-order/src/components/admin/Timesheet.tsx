import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update, push, remove } from 'firebase/database';
import { users, User } from '../../data/users';
import { FaEdit, FaTrashAlt, FaHourglassStart, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { LuCalendarPlus } from 'react-icons/lu';

interface Deduction {
  reason: string;
  amount: number;
}

interface Bonus {
  reason: string;
  amount: number;
}

interface TimesheetRecord {
  id?: string;
  userName: string;
  checkIn: string;
  checkOut: string | null;
  durationHours: number | null;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  salaryPerHour: number;
  baseSalary: number | null;
  salary: number | null;
  deductions: Deduction[];
  bonuses: Bonus[];
  createdBy: 'user' | 'admin';
  createdAt: string;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
}

interface TimesheetAdminPageProps {
  filterType: 'all' | 'day' | 'week' | 'month' | 'year' | 'range';
  filterDate: string;
  startDate: string;
  endDate: string;
  filterUser: string;
}

const TimesheetAdminPage: React.FC<TimesheetAdminPageProps> = ({ filterType, filterDate, startDate, endDate, filterUser }) => {
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [editRecord, setEditRecord] = useState<TimesheetRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<TimesheetRecord>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [totalStats, setTotalStats] = useState({ hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 });

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const recordsRef = ref(db, 'timesheet_data/records');
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordList = Object.entries(data).map(([id, record]: [string, any]) => ({
          ...record,
          id,
          deductions: record.deductions || [],
          bonuses: record.bonuses || [],
          note: record.note || '',
          confirmedAt: record.confirmedAt || null,
          confirmedBy: record.confirmedBy || null,
        }));

        const filteredRecords = recordList.filter((r) => {
          const recordDate = r.checkIn.slice(0, 8);
          if (filterType === 'all') return true;
          if (filterType === 'day') return recordDate === filterDate;
          if (filterType === 'week') {
            const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return (
              recordDate >= weekStart.toISOString().slice(0, 10).replace(/-/g, '') &&
              recordDate <= weekEnd.toISOString().slice(0, 10).replace(/-/g, '')
            );
          }
          if (filterType === 'month') return recordDate.startsWith(filterDate.slice(0, 6));
          if (filterType === 'year') return recordDate.startsWith(filterDate.slice(0, 4));
          if (filterType === 'range' && startDate && endDate) {
            return recordDate >= startDate && recordDate <= endDate;
          }
          return true;
        }).filter((r) => !filterUser || r.userName === users.find((u) => u.userId === filterUser)?.name);

        const sortedRecords = filteredRecords.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
        setRecords(sortedRecords);

        const stats = filteredRecords.reduce(
          (acc, r) => ({
            hours: acc.hours + (r.durationHours || 0),
            baseSalary: acc.baseSalary + (r.baseSalary || 0),
            bonuses: acc.bonuses + r.bonuses.reduce((sum: number, b: Bonus) => sum + b.amount, 0),
            deductions: acc.deductions + r.deductions.reduce((sum: number, d: Deduction) => sum + d.amount, 0),
            salary: acc.salary + (r.salary || 0),
          }),
          { hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 }
        );
        setTotalStats(stats);
      } else {
        setRecords([]);
        setTotalStats({ hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 });
      }
    });
    return () => unsubscribe();
  }, [filterType, filterDate, startDate, endDate, filterUser]);

  const formatTimestamp = (date: Date = new Date()) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  const parseTimestamp = (timestamp: string) => {
    const [date, time] = timestamp.split('_');
    const [year, month, day] = date.match(/(\d{4})(\d{2})(\d{2})/)!.slice(1);
    const [hour, minute, second] = time.match(/(\d{2})(\d{2})(\d{2})/)!.slice(1);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const inTime = new Date(checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    const outTime = new Date(checkOut.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    return (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
  };

  const handleApprove = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    if (!record.checkOut) {
      alert('Bản ghi chưa check-out, không thể duyệt.');
      return;
    }
    const salary =
      (record.baseSalary || 0) +
      record.bonuses.reduce((sum, b) => sum + b.amount, 0) -
      record.deductions.reduce((sum, d) => sum + d.amount, 0);
    update(ref(db, `timesheet_data/records/${recordId}`), {
      status: 'approved',
      confirmedAt: formatTimestamp(new Date()),
      confirmedBy: 'admin',
      salary,
    }).catch(() => {
      alert('Lỗi khi duyệt bản ghi.');
    });
  };

  const handleReject = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    if (!record.checkOut) {
      alert('Bản ghi chưa check-out, không thể từ chối.');
      return;
    }
    update(ref(db, `timesheet_data/records/${recordId}`), {
      status: 'rejected',
      confirmedAt: formatTimestamp(new Date()),
      confirmedBy: 'admin',
    }).catch(() => {
      alert('Lỗi khi từ chối bản ghi.');
    });
  };

  const handleEdit = (record: TimesheetRecord) => {
    setEditRecord({ ...record });
  };

  const handleSaveEdit = () => {
    if (!editRecord?.id) return;
    const duration = editRecord.checkOut && editRecord.checkIn ? calculateDuration(editRecord.checkIn, editRecord.checkOut) : null;
    const baseSalary = duration ? Math.round(duration * editRecord.salaryPerHour) : null;
    const salary = baseSalary
      ? baseSalary +
        editRecord.bonuses.reduce((sum, b) => sum + b.amount, 0) -
        editRecord.deductions.reduce((sum, d) => sum + d.amount, 0)
      : null;
    update(ref(db, `timesheet_data/records/${editRecord.id}`), {
      ...editRecord,
      durationHours: duration,
      baseSalary,
      salary,
      confirmedAt: editRecord.status === 'approved' ? formatTimestamp(new Date()) : editRecord.confirmedAt,
      confirmedBy: editRecord.status === 'approved' ? 'admin' : editRecord.confirmedBy,
    })
      .then(() => {
        setEditRecord(null);
      })
      .catch(() => {
        alert('Lỗi khi lưu bản ghi.');
      });
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      remove(ref(db, `timesheet_data/records/${recordId}`)).catch(() => {
        alert('Lỗi khi xóa bản ghi.');
      });
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.userName || !newRecord.checkIn) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const user = users.find((u) => u.name === newRecord.userName);
    const duration = newRecord.checkOut ? calculateDuration(newRecord.checkIn!, newRecord.checkOut) : null;
    const baseSalary = duration ? Math.round(duration * (newRecord.salaryPerHour || user!.salaryPerHour)) : null;
    const salary = baseSalary
      ? baseSalary +
        (newRecord.bonuses || []).reduce((sum: number, b: Bonus) => sum + b.amount, 0) -
        (newRecord.deductions || []).reduce((sum: number, d: Deduction) => sum + d.amount, 0)
      : null;
    push(ref(db, 'timesheet_data/records'), {
      ...newRecord,
      durationHours: duration,
      baseSalary,
      salary,
      salaryPerHour: newRecord.salaryPerHour || user!.salaryPerHour,
      status: newRecord.status || 'pending',
      createdBy: 'admin',
      createdAt: formatTimestamp(new Date()),
      confirmedAt: newRecord.status === 'approved' ? formatTimestamp(new Date()) : null,
      confirmedBy: newRecord.status === 'approved' ? 'admin' : null,
    })
      .then(() => {
        setNewRecord({});
        setShowAddModal(false);
      })
      .catch(() => {
        alert('Lỗi khi thêm bản ghi.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản Lý Chấm Công</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
            <div className="flex items-center justify-between md:justify-center">
              <div className="font-medium">Tổng giờ:</div>
              <div>{totalStats.hours.toFixed(1)}h</div>
            </div>
            <div className="flex items-center justify-between md:justify-center">
              <div className="font-medium">Lương gốc:</div>
              <div>{formatCurrency(totalStats.baseSalary)}</div>
            </div>
            <div className="flex items-center justify-between md:justify-center">
              <div className="font-medium">Tổng thưởng:</div>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowBonusModal(true)}
              >
                {formatCurrency(totalStats.bonuses)}
              </button>
            </div>
            <div className="flex items-center justify-between md:justify-center">
              <div className="font-medium">Tổng trừ:</div>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowDeductionModal(true)}
              >
                {formatCurrency(totalStats.deductions)}
              </button>
            </div>
            <div className="flex items-center justify-between md:justify-center">
              <div className="font-medium">Tổng lương:</div>
              <div>{formatCurrency(totalStats.salary)}</div>
            </div>
          </div>
        </div>
        <div className="mb-6 flex justify-end">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            onClick={() => setShowAddModal(true)}
          >
            <LuCalendarPlus className="inline mr-2" />
            Thêm bản ghi
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          {records.length === 0 ? (
            <p className="text-gray-500">Không có bản ghi.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="text-sm min-w-[1000px]">
                <div className="grid grid-cols-8 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-xl">
                  <span>Nhân viên</span>
                  <span>Ngày</span>
                  <span>Giờ vào</span>
                  <span>Giờ ra</span>
                  <span>Giờ làm</span>
                  <span>Lương</span>
                  <span>Trạng thái</span>
                  <span>Hành động</span>
                </div>
                {records.map((record) => (
                  <div key={record.id} className="grid grid-cols-8 gap-4 p-3 border-b hover:bg-gray-50">
                    <span>{record.userName}</span>
                    <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                    <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6')}</span>
                    <span>{record.checkOut ? record.checkOut.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6') : 'Chưa'}</span>
                    <span>{record.durationHours ? record.durationHours.toFixed(1) + 'h' : '-'}</span>
                    <span>{formatCurrency(record.salary)}</span>
                    <span className="flex items-center gap-1">
                      {record.status === 'pending' ? (
                        <>
                          <FaHourglassStart className="text-yellow-500" />
                          Chờ duyệt
                        </>
                      ) : record.status === 'approved' ? (
                        <>
                          <FaCheckCircle className="text-green-500" />
                          Đã duyệt
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-red-500" />
                          Từ chối
                        </>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={() => handleEdit(record)}
                      >
                        <FaEdit />
                      </button>
                      {record.status === 'pending' && record.checkOut && (
                        <>
                          <button
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            onClick={() => handleApprove(record.id!)}
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            onClick={() => handleReject(record.id!)}
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      <button
                        className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                        onClick={() => handleDelete(record.id!)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {editRecord && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditRecord(null);
            }}
          >
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Sửa bản ghi</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <label className="font-medium">Nhân viên:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={users.find((u) => u.name === editRecord.userName)?.userId || ''}
                  onChange={(e) => {
                    const user = users.find((u) => u.userId === e.target.value);
                    setEditRecord({ ...editRecord, userName: user?.name || '', salaryPerHour: user?.salaryPerHour || 40000 });
                  }}
                >
                  <option value="">Chọn nhân viên</option>
                  {users.filter((u) => u.role === 'employee').map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <label className="font-medium">Giờ vào:</label>
                <input
                  type="datetime-local"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editRecord.checkIn ? parseTimestamp(editRecord.checkIn).slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setEditRecord({ ...editRecord, checkIn: date ? formatTimestamp(date) : '' });
                  }}
                />
                <label className="font-medium">Giờ ra:</label>
                <input
                  type="datetime-local"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editRecord.checkOut ? parseTimestamp(editRecord.checkOut).slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setEditRecord({ ...editRecord, checkOut: date ? formatTimestamp(date) : null });
                  }}
                />
                <label className="font-medium">Lương/giờ:</label>
                <input
                  type="text"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formatCurrency(editRecord.salaryPerHour)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setEditRecord({ ...editRecord, salaryPerHour: value ? Number(value) : 0 });
                  }}
                />
                <label className="font-medium">Ghi chú:</label>
                <input
                  type="text"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editRecord.note || ''}
                  onChange={(e) => setEditRecord({ ...editRecord, note: e.target.value })}
                />
                <label className="font-medium">Thưởng:</label>
                <div className="flex flex-col gap-2">
                  {editRecord.bonuses.map((bonus, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                        value={bonus.reason}
                        onChange={(e) => {
                          const newBonuses = [...editRecord.bonuses];
                          newBonuses[index].reason = e.target.value;
                          setEditRecord({ ...editRecord, bonuses: newBonuses });
                        }}
                      />
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/3"
                        value={formatCurrency(bonus.amount)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newBonuses = [...editRecord.bonuses];
                          newBonuses[index].amount = value ? Number(value) : 0;
                          setEditRecord({ ...editRecord, bonuses: newBonuses });
                        }}
                      />
                      <button
                        className="p-2 text-red-500 hover:text-red-600"
                        onClick={() => {
                          const newBonuses = editRecord.bonuses.filter((_, i) => i !== index);
                          setEditRecord({ ...editRecord, bonuses: newBonuses });
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => setEditRecord({ ...editRecord, bonuses: [...editRecord.bonuses, { reason: '', amount: 0 }] })}
                  >
                    Thêm thưởng
                  </button>
                </div>
                <label className="font-medium">Trừ:</label>
                <div className="flex flex-col gap-2">
                  {editRecord.deductions.map((deduction, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                        value={deduction.reason}
                        onChange={(e) => {
                          const newDeductions = [...editRecord.deductions];
                          newDeductions[index].reason = e.target.value;
                          setEditRecord({ ...editRecord, deductions: newDeductions });
                        }}
                      />
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/3"
                        value={formatCurrency(deduction.amount)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newDeductions = [...editRecord.deductions];
                          newDeductions[index].amount = value ? Number(value) : 0;
                          setEditRecord({ ...editRecord, deductions: newDeductions });
                        }}
                      />
                      <button
                        className="p-2 text-red-500 hover:text-red-600"
                        onClick={() => {
                          const newDeductions = editRecord.deductions.filter((_, i) => i !== index);
                          setEditRecord({ ...editRecord, deductions: newDeductions });
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => setEditRecord({ ...editRecord, deductions: [...editRecord.deductions, { reason: '', amount: 0 }] })}
                  >
                    Thêm trừ
                  </button>
                </div>
                <label className="font-medium">Trạng thái:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editRecord.status}
                  onChange={(e) => setEditRecord({ ...editRecord, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
                >
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  onClick={handleSaveEdit}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
          >
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Thêm bản ghi</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <label className="font-medium">Nhân viên:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={users.find((u) => u.name === newRecord.userName)?.userId || ''}
                  onChange={(e) => {
                    const user = users.find((u) => u.userId === e.target.value);
                    setNewRecord({ ...newRecord, userName: user?.name, salaryPerHour: user?.salaryPerHour });
                  }}
                >
                  <option value="">Chọn nhân viên</option>
                  {users.filter((u) => u.role === 'employee').map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <label className="font-medium">Giờ vào:</label>
                <input
                  type="datetime-local"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newRecord.checkIn ? parseTimestamp(newRecord.checkIn).slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setNewRecord({ ...newRecord, checkIn: date ? formatTimestamp(date) : '' });
                  }}
                />
                <label className="font-medium">Giờ ra:</label>
                <input
                  type="datetime-local"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newRecord.checkOut ? parseTimestamp(newRecord.checkOut).slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setNewRecord({ ...newRecord, checkOut: date ? formatTimestamp(date) : null });
                  }}
                />
                <label className="font-medium">Ghi chú:</label>
                <input
                  type="text"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newRecord.note || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, note: e.target.value })}
                />
                <label className="font-medium">Thưởng:</label>
                <div className="flex flex-col gap-2">
                  {(newRecord.bonuses || []).map((bonus: Bonus, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                        value={bonus.reason}
                        onChange={(e) => {
                          const newBonuses = [...(newRecord.bonuses || [])];
                          newBonuses[index].reason = e.target.value;
                          setNewRecord({ ...newRecord, bonuses: newBonuses });
                        }}
                      />
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/3"
                        value={formatCurrency(bonus.amount)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newBonuses = [...(newRecord.bonuses || [])];
                          newBonuses[index].amount = value ? Number(value) : 0;
                          setNewRecord({ ...newRecord, bonuses: newBonuses });
                        }}
                      />
                      <button
                        className="p-2 text-red-500 hover:text-red-600"
                        onClick={() => {
                          const newBonuses = (newRecord.bonuses || []).filter((_, i) => i !== index);
                          setNewRecord({ ...newRecord, bonuses: newBonuses });
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => setNewRecord({ ...newRecord, bonuses: [...(newRecord.bonuses || []), { reason: '', amount: 0 }] })}
                  >
                    Thêm thưởng
                  </button>
                </div>
                <label className="font-medium">Trừ:</label>
                <div className="flex flex-col gap-2">
                  {(newRecord.deductions || []).map((deduction: Deduction, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                        value={deduction.reason}
                        onChange={(e) => {
                          const newDeductions = [...(newRecord.deductions || [])];
                          newDeductions[index].reason = e.target.value;
                          setNewRecord({ ...newRecord, deductions: newDeductions });
                        }}
                      />
                      <input
                        type="text"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/3"
                        value={formatCurrency(deduction.amount)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newDeductions = [...(newRecord.deductions || [])];
                          newDeductions[index].amount = value ? Number(value) : 0;
                          setNewRecord({ ...newRecord, deductions: newDeductions });
                        }}
                      />
                      <button
                        className="p-2 text-red-500 hover:text-red-600"
                        onClick={() => {
                          const newDeductions = (newRecord.deductions || []).filter((_, i) => i !== index);
                          setNewRecord({ ...newRecord, deductions: newDeductions });
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => setNewRecord({ ...newRecord, deductions: [...(newRecord.deductions || []), { reason: '', amount: 0 }] })}
                  >
                    Thêm trừ
                  </button>
                </div>
                <label className="font-medium">Trạng thái:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newRecord.status || 'pending'}
                  onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
                >
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  onClick={handleAddRecord}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}
        {showBonusModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowBonusModal(false);
            }}
          >
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Chi tiết thưởng</h3>
              {records.flatMap((record) =>
                record.bonuses.map((bonus, index) => (
                  <div key={`${record.id}-bonus-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b text-sm">
                    <span>{record.userName}</span>
                    <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                    <span>{bonus.reason}: {formatCurrency(bonus.amount)}</span>
                  </div>
                ))
              ).length === 0 ? (
                <p className="text-gray-500">Không có thưởng.</p>
              ) : (
                <div className="text-sm">
                  <div className="grid grid-cols-3 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-xl">
                    <span>Nhân viên</span>
                    <span>Ngày</span>
                    <span>Thưởng</span>
                  </div>
                  {records.flatMap((record) =>
                    record.bonuses.map((bonus, index) => (
                      <div key={`${record.id}-bonus-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b">
                        <span>{record.userName}</span>
                        <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                        <span>{bonus.reason}: {formatCurrency(bonus.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {showDeductionModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeductionModal(false);
            }}
          >
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Chi tiết trừ</h3>
              {records.flatMap((record) =>
                record.deductions.map((deduction, index) => (
                  <div key={`${record.id}-deduction-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b text-sm">
                    <span>{record.userName}</span>
                    <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                    <span>{deduction.reason}: {formatCurrency(deduction.amount)}</span>
                  </div>
                ))
              ).length === 0 ? (
                <p className="text-gray-500">Không có khoản trừ.</p>
              ) : (
                <div className="text-sm">
                  <div className="grid grid-cols-3 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-xl">
                    <span>Nhân viên</span>
                    <span>Ngày</span>
                    <span>Khoản trừ</span>
                  </div>
                  {records.flatMap((record) =>
                    record.deductions.map((deduction, index) => (
                      <div key={`${record.id}-deduction-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b">
                        <span>{record.userName}</span>
                        <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                        <span>{deduction.reason}: {formatCurrency(deduction.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetAdminPage;