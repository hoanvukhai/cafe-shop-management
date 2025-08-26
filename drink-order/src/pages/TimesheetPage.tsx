import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { users, User } from '../data/users';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FaEye, FaEdit, FaHourglassStart, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GrFingerPrint } from 'react-icons/gr';
import { menu_items, MenuItem } from '../data/menu_items';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

interface Deduction {
  menuItemId: string;
  reason: string;
  amount: number;
}

interface Bonus {
  reason: string;
  amount: number;
}

export interface TimesheetRecord {
  id?: string;
  userName: string;
  checkIn: string;
  checkOut: string | null;
  durationHours: number | null;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  salaryPerHour: number;
  baseSalary: number | null;
  salary: number;
  deductions: Deduction[];
  bonuses: Bonus[];
  createdBy: 'user' | 'admin';
  createdAt: string;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
}

const TimesheetPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [todayStr, setTodayStr] = useState(() => {
    const simulated = localStorage.getItem('debug_today');
    return simulated || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  });
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<TimesheetRecord | null>(null);
  const [editRecord, setEditRecord] = useState<TimesheetRecord | null>(null);
  const [tempDeductions, setTempDeductions] = useState<Deduction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'day' | 'week' | 'month' | 'year' | 'range'>('day');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [customDeduction, setCustomDeduction] = useState({ reason: '', amount: 0 });
  const allMenuItems: MenuItem[] = Object.values(menu_items).flat().filter(item => item.available);
  const [totalStats, setTotalStats] = useState({ hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 });
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>(tempDeductions.map(d => d.reason || ''));
  const [showDropdown, setShowDropdown] = useState<boolean[]>(tempDeductions.map(() => false));
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number | null): string => {
    if (amount === null || amount === 0) return '0';
    return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = localStorage.getItem('debug_today') || new Date().toISOString().slice(0, 10).replace(/-/g, '');
      setTodayStr(prev => (prev !== newToday ? newToday : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          salary: record.salary !== undefined ? record.salary : (record.baseSalary || 0) + 
                  (record.bonuses || []).reduce((sum: number, b: Bonus) => sum + b.amount, 0) - 
                  (record.deductions || []).reduce((sum: number, d: Deduction) => sum + d.amount, 0)
        }));
        setRecords(recordList);
        const filteredRecords = filterRecords(recordList);
        const stats = filteredRecords.reduce((acc, r) => ({
          hours: acc.hours + (r.durationHours || 0),
          baseSalary: acc.baseSalary + (r.baseSalary || 0),
          bonuses: acc.bonuses + r.bonuses.reduce((sum: number, b: Bonus) => sum + b.amount, 0),
          deductions: acc.deductions + r.deductions.reduce((sum: number, d: Deduction) => sum + d.amount, 0),
          salary: acc.salary + r.salary
        }), { hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 });
        setTotalStats(stats);
      } else {
        setRecords([]);
        setTotalStats({ hours: 0, baseSalary: 0, bonuses: 0, deductions: 0, salary: 0 });
      }
    });
    return () => unsubscribe();
  }, [selectedUser, filterType, filterDate, startDate, endDate]);

  const filterRecords = (records: TimesheetRecord[]) => {
    return records.filter(r => {
      if (!selectedUser || r.userName === users.find(u => u.userId === selectedUser)?.name) {
        const checkInDate = r.checkIn.slice(0, 8);
        if (filterType === 'all') return true;
        if (filterType === 'day') return checkInDate === filterDate;
        if (filterType === 'week') {
          const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return (
            checkInDate >= weekStart.toISOString().slice(0, 10).replace(/-/g, '') &&
            checkInDate <= weekEnd.toISOString().slice(0, 10).replace(/-/g, '')
          );
        }
        if (filterType === 'month') return checkInDate.slice(0, 6) === filterDate.slice(0, 6);
        if (filterType === 'year') return checkInDate.slice(0, 4) === filterDate.slice(0, 4);
        if (filterType === 'range') return checkInDate >= startDate && checkInDate <= endDate;
        return true;
      }
      return false;
    });
  };

  const formatTimestamp = (date: Date = new Date()) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const inTime = new Date(checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    const outTime = new Date(checkOut.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    return (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
  };

  const handleCheckIn = () => {
    if (!selectedUser) {
      setMessage('Vui lòng chọn nhân viên.');
      return;
    }
    const selected = users.find(u => u.userId === selectedUser);
    if (!selected) {
      setMessage('Nhân viên không hợp lệ.');
      return;
    }
    const userRecords = records.filter(r => r.userName === selected.name && r.status === 'pending' && !r.checkOut);
    if (userRecords.length > 0) {
      setMessage('Vui lòng check-out ca hiện tại trước khi tạo ca mới.');
      return;
    }
    const newRecord: TimesheetRecord = {
      userName: selected.name,
      checkIn: formatTimestamp(new Date()),
      checkOut: null,
      durationHours: null,
      location: '192.168.1.10',
      status: 'pending',
      note: '',
      salaryPerHour: selected.salaryPerHour,
      baseSalary: null,
      salary: 0,
      deductions: [],
      bonuses: [],
      createdBy: 'user',
      createdAt: formatTimestamp(new Date())
    };
    push(ref(db, 'timesheet_data/records'), newRecord).then(() => {
      setMessage('Check-in thành công!');
    }).catch(() => {
      setMessage('Lỗi khi check-in.');
    });
  };

  const handleCheckOut = () => {
    if (!selectedUser) {
      setMessage('Vui lòng chọn nhân viên.');
      return;
    }
    const selected = users.find(u => u.userId === selectedUser);
    if (!selected) {
      setMessage('Nhân viên không hợp lệ.');
      return;
    }
    const userRecords = records.filter(r => r.userName === selected.name && r.status === 'pending' && !r.checkOut);
    const pendingRecord = userRecords.find(r => r.status === 'pending' && !r.checkOut);
    if (!pendingRecord) {
      setMessage('Không có bản ghi check-in để check-out.');
      return;
    }
    const checkOutTime = formatTimestamp(new Date());
    const duration = calculateDuration(pendingRecord.checkIn, checkOutTime);
    const baseSalary = Math.round(duration * pendingRecord.salaryPerHour);
    const salary = baseSalary + 
      (pendingRecord.bonuses || []).reduce((sum, b) => sum + b.amount, 0) - 
      (pendingRecord.deductions || []).reduce((sum, d) => sum + d.amount, 0);
    update(ref(db, `timesheet_data/records/${pendingRecord.id}`), {
      checkOut: checkOutTime,
      durationHours: duration,
      baseSalary,
      salary
    }).then(() => {
      setMessage('Check-out thành công!');
    }).catch(() => {
      setMessage('Lỗi khi check-out.');
    });
  };

  const handleEdit = (record: TimesheetRecord) => {
    if (record.status !== 'pending') {
      setMessage('Bản ghi đã khóa hoặc đã duyệt, không thể sửa.');
      return;
    }
    let initialDeductions = record.deductions || [];
    if (initialDeductions.length === 0) {
      initialDeductions = [{ menuItemId: '', reason: '', amount: 0 }];
    }
    setEditRecord(record);
    setTempDeductions(initialDeductions);
    setCurrentEditingIndex(null);
  };

  const handleSaveEdit = () => {
    if (!editRecord?.id) return;
    const salary = (editRecord.baseSalary || 0) +
      editRecord.bonuses.reduce((sum, b) => sum + b.amount, 0) -
      tempDeductions.reduce((sum, d) => sum + d.amount, 0);
    update(ref(db, `timesheet_data/records/${editRecord.id}`), {
      ...editRecord,
      deductions: tempDeductions,
      salary
    }).then(() => {
      setEditRecord(null);
      setTempDeductions([]);
      setMessage('Cập nhật bản ghi thành công!');
    }).catch(() => {
      setMessage('Lỗi khi cập nhật bản ghi.');
    });
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      remove(ref(db, `timesheet_data/records/${recordId}`)).catch(() => {
        alert('Lỗi khi xóa bản ghi.');
      });
    }
  };

  const handleAddDeduction = (index: number) => {
    if (!tempDeductions[index].reason || tempDeductions[index].amount <= 0) {
      setMessage('Vui lòng nhập lý do và số tiền hợp lệ.');
      return;
    }
    setTempDeductions([...tempDeductions]);
    setSearchTerm('');
    setCustomDeduction({ reason: '', amount: 0 });
    setShowSearchDropdown(false);
    setCurrentEditingIndex(null); // Reset sau khi add
    // Tự động add field mới trống để tiếp tục
    setTempDeductions(prev => [...prev, { menuItemId: '', reason: '', amount: 0 }]);
  };

  const handleSelectMenuItem = (item: MenuItem, index: number) => {
    const newDeductions = [...tempDeductions];
    newDeductions[index] = {
      menuItemId: item.id,
      reason: item.name,
      amount: item.price * 0.5
    };
    setTempDeductions(newDeductions);
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  const openDetails = (record: TimesheetRecord) => {
    setSelectedRecord(record);
  };

  const getChartData = () => {
    const employeeNames = selectedUser
      ? [users.find(u => u.userId === selectedUser)?.name || '']
      : users.filter(u => u.role === 'employee').map(u => u.name);
    let timeRange: string[] = [];

    if (filterType === 'all') {
      const years = Array.from(new Set(records.map(r => r.checkIn.slice(0, 4)))).sort();
      timeRange = years;
    } else if (filterType === 'day') {
      timeRange = [filterDate];
    } else if (filterType === 'week') {
      const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      timeRange = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else if (filterType === 'month') {
      const [year, month] = filterDate.match(/(\d{4})(\d{2})/)!.slice(1);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      timeRange = Array.from({ length: daysInMonth }, (_, i) => `${year}${month}${(i + 1).toString().padStart(2, '0')}`);
    } else if (filterType === 'year') {
      timeRange = [filterDate.slice(0, 4)];
    } else if (filterType === 'range') {
      const start = new Date(startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      const end = new Date(endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      timeRange = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        timeRange.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
      }
    }

    const totalHoursData = {
      labels: employeeNames,
      datasets: [{
        label: 'Tổng giờ làm',
        data: employeeNames.map(name => {
          const filteredRecords = filterRecords(records).filter(r => r.userName === name);
          return filteredRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0);
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const groupedBarData = {
      labels: timeRange.map(t => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: employeeNames.map((name, index) => ({
        label: name,
        data: timeRange.map(time => {
          const filteredRecords = filterRecords(records).filter(r => {
            if (r.userName !== name) return false;
            const checkInDate = r.checkIn.slice(0, 8);
            if (filterType === 'year' || filterType === 'all') return checkInDate.startsWith(time);
            if (filterType === 'month') return checkInDate.slice(0, 8) === time;
            return checkInDate === time;
          });
          return filteredRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0);
        }),
        backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
        borderColor: `hsl(${index * 60}, 70%, 40%)`,
        borderWidth: 1
      }))
    };

    const lineData = {
      labels: timeRange.map(t => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: employeeNames.map((name, index) => ({
        label: name,
        data: timeRange.map(time => {
          const filteredRecords = filterRecords(records).filter(r => {
            if (r.userName !== name) return false;
            const checkInDate = r.checkIn.slice(0, 8);
            if (filterType === 'year' || filterType === 'all') return checkInDate.startsWith(time);
            if (filterType === 'month') return checkInDate.slice(0, 8) === time;
            return checkInDate === time;
          });
          return filteredRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0);
        }),
        fill: false,
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        tension: 0.1
      }))
    };

    return { totalHoursData, groupedBarData, lineData };
  };

  const { totalHoursData, groupedBarData, lineData } = getChartData();

  const filteredRecords = filterRecords(records);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Chấm Công</h1>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <label className="font-medium text-sm">Nhân viên:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Chọn nhân viên</option>
                  {users.filter(u => u.role === 'employee').map(user => (
                    <option key={user.userId} value={user.userId}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <label className="font-medium text-sm">Lọc:</label>
                <select
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'day' | 'week' | 'month' | 'year' | 'range')}
                >
                  <option value="all">Tất cả</option>
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                  <option value="range">Khoảng thời gian</option>
                </select>
              </div>
              {selectedUser && records.filter(r => r.userName === users.find(u => u.userId === selectedUser)?.name && r.status === 'pending' && !r.checkOut).length === 0 ? (
                <button
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex-1 flex items-center justify-center gap-2"
                  onClick={handleCheckIn}
                >
                  <GrFingerPrint />
                  Check-in
                </button>
              ) : selectedUser ? (
                <button
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex-1 flex items-center justify-center gap-2"
                  onClick={handleCheckOut}
                >
                  <GrFingerPrint />
                  Check-out
                </button>
              ) : null}
            </div>
            {(filterType === 'day' || filterType === 'week' || filterType === 'month' || filterType === 'year') && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="font-medium text-sm">Ngày:</label>
                  <div
                      className="relative p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex-1"
    onClick={(e) => {
      const input = e.currentTarget.querySelector('input');
      input?.showPicker(); // Kích hoạt lịch
    }}
                  >
                    <input
                    type="date"
      className="w-full h-full bg-transparent outline-none text-sm cursor-pointer"
                    value={filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
                    onChange={(e) => setFilterDate(e.target.value.replace(/-/g, ''))}
                  />
                  </div>
                </div>
              </div>
            )}
            {filterType === 'range' && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="font-medium text-sm">Từ:</label>
                  <div
                      className="relative p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex-1"
    onClick={(e) => {
      const input = e.currentTarget.querySelector('input');
      input?.showPicker(); // Kích hoạt lịch
    }}
                  ><input
                    type="date"
      className="w-full h-full bg-transparent outline-none text-sm cursor-pointer"
                    value={startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''}
                    onChange={(e) => {
                      const newStartDate = e.target.value.replace(/-/g, '');
                      if (newStartDate <= endDate || !endDate) setStartDate(newStartDate);
                      else setMessage('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
                    }}
                  /></div>
                  
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="font-medium text-sm">Đến:</label>
                  <div
                      className="relative p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex-1"
    onClick={(e) => {
      const input = e.currentTarget.querySelector('input');
      input?.showPicker(); // Kích hoạt lịch
    }}
                  >
                  <input
                    type="date"
      className="w-full h-full bg-transparent outline-none text-sm cursor-pointer"
                    value={endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''}
                    onChange={(e) => {
                      const newEndDate = e.target.value.replace(/-/g, '');
                      if (newEndDate >= startDate || !startDate) setEndDate(newEndDate);
                      else setMessage('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
                    }}
                  />                    
                  </div>

                </div>
              </div>
            )}
          </div>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {message}
            </p>
          )}
        </div>
        {selectedUser && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 w-full">
            <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
              <div className="flex items-center justify-between md:justify-center w-full"><div className="font-medium">Tổng giờ:</div> <div>{totalStats.hours.toFixed(1)}h</div></div>
              <div className="flex items-center justify-between md:justify-center w-full"><div className="font-medium">Lương gốc:</div> <div>{formatCurrency(totalStats.baseSalary)}</div></div>
              <div className="flex items-center gap-2 justify-between md:justify-center w-full">
                <div className="font-medium">Tổng thưởng:</div>
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => setShowBonusModal(true)}
                >
                  {formatCurrency(totalStats.bonuses)}
                </button>
              </div>
              <div className="flex items-center gap-2 justify-between md:justify-center w-full">
                <div className="font-medium">Tổng trừ:</div>
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => setShowDeductionModal(true)}
                >
                  {formatCurrency(totalStats.deductions)}
                </button>
              </div>
              <div className="flex items-center gap-2 justify-between md:justify-center w-full">
                <div className="font-medium">Tổng lương:</div>
                <div className={`${totalStats.salary < 0 ? 'text-red-600' : ''}`}>{formatCurrency(totalStats.salary)}</div>
              </div>
            </div>
          </div>
        )}
        {selectedUser ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lịch Sử Chấm Công - {users.find(u => u.userId === selectedUser)?.name}</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              {filterRecords(records).length === 0 ? (
                <p className="text-gray-500">Chưa có bản ghi.</p>
              ) : (
                <div className="xl:overflow-x-visible overflow-x-auto">
                  <div className="text-sm xl:min-w-fit min-w-[1300px] timesheet-table">
                    <div className="grid grid-cols-7 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-lg xl:min-w-fit min-w-[1300px]">
                      <span>Ngày</span>
                      <span>Giờ vào</span>
                      <span>Giờ ra</span>
                      <span>Giờ làm</span>
                      <span>Lương</span>
                      <span>Trạng thái</span>
                      <span>Hành động</span>
                    </div>
                    {filterRecords(records).map(record => (
                      <div key={record.id} className="grid grid-cols-7 gap-4 p-3 border-b hover:bg-gray-50 xl:min-w-fit min-w-[1300px]">
                        <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                        <span>{record.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6')}</span>
                        <span>{record.checkOut ? record.checkOut.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6') : 'Chưa'}</span>
                        <span>{record.durationHours ? record.durationHours.toFixed(1) + 'h' : '-'}</span>
                        <span className={`${record.salary < 0 ? 'text-red-600' : ''}`}>{formatCurrency(record.salary)}</span>
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
                              <FaTimesCircle className="text-red-600" />
                              Từ chối
                            </>
                          )}
                        </span>
                        <div className="w-40 flex gap-2 items-center justify-start">
                          <button
                            className="text-blue-500 hover:text-blue-600 flex items-center justify-between gap-1 w-16"
                            onClick={() => openDetails(record)}
                          >
                            <FaEye className="react-icons size-4" /> Chi tiết
                          </button>
                          {record.status === 'pending' && (
                            <button
                              className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1"
                              onClick={() => handleEdit(record)}
                            >
                              <FaEdit className="react-icons size-4" /> Sửa
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Tổng số giờ làm việc</h2>
              <Bar data={totalHoursData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Giờ làm mỗi ngày</h2>
              <Bar data={groupedBarData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Xu hướng giờ làm</h2>
              <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>
        )}
        {selectedRecord && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRecord(null);
            }}
          >
            <div className="bg-white p-8 rounded-2xl max-w-xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-100">
              <h3 className="text-xl font-semibold mb-6">Chi tiết bản ghi</h3>
              <div className="grid grid-cols-2 gap-4 text-base">
                <p className="font-medium">Nhân viên:</p>
                <p>{selectedRecord.userName}</p>
                <p className="font-medium">Ngày:</p>
                <p>{selectedRecord.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</p>
                <p className="font-medium">Giờ vào:</p>
                <p>{selectedRecord.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6')}</p>
                <p className="font-medium">Giờ ra:</p>
                <p>{selectedRecord.checkOut ? selectedRecord.checkOut.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$4:$5:$6') : 'Chưa'}</p>
                <p className="font-medium">Giờ làm:</p>
                <p>{selectedRecord.durationHours ? selectedRecord.durationHours.toFixed(1) + 'h' : '-'}</p>
                <p className="font-medium">Lương gốc:</p>
                <p>{formatCurrency(selectedRecord.baseSalary)}</p>
                <p className="font-medium">Thưởng:</p>
                <p>{selectedRecord.bonuses.length > 0 ? selectedRecord.bonuses.map(b => `${b.reason}: ${formatCurrency(b.amount)}`).join(', ') : 'Không'}</p>
                <p className="font-medium">Trừ:</p>
                <p>{selectedRecord.deductions.length > 0 ? selectedRecord.deductions.map(d => `${d.reason}: ${formatCurrency(d.amount)}`).join(', ') : 'Không'}</p>
                <p className="font-medium">Tổng lương:</p>
                <p className={`${selectedRecord.salary < 0 ? 'text-red-600' : ''}`}>{formatCurrency(selectedRecord.salary)}</p>
                <p className="font-medium">Ghi chú:</p>
                <p>{selectedRecord.note || 'Không'}</p>
                <p className="font-medium">Trạng thái:</p>
                <p className="flex items-center gap-1 text-base">
                  {selectedRecord.status === 'pending' ? (
                    <>
                      <FaHourglassStart className="text-yellow-500" />
                      Chờ duyệt
                    </>
                  ) : selectedRecord.status === 'approved' ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      Đã duyệt
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-600" />
                      Từ chối
                    </>
                  )}
                </p>
                <p className="font-medium">Địa điểm:</p>
                <p>{selectedRecord.location}</p>
              </div>
            </div>
          </div>
        )}
{editRecord && (
  <div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setEditRecord(null);
        setTempDeductions([]);
        setSearchTerms(tempDeductions.map(() => ''));
      }
    }}
  >
    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg md:max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl border border-gray-200 min-h-[40vh]">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Sửa bản ghi</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-medium text-base md:text-lg text-gray-700">Khoản trừ:</label>
          <div className="space-y-4">
            {tempDeductions.map((deduction, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center relative">
                <div className="w-full md:w-2/3">
<input
  type="text"
  className="p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-base md:text-lg bg-gray-50"
  placeholder="Nhập món hoặc lý do..."
  value={searchTerms[index] || deduction.reason || ''}
  onChange={(e) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = e.target.value;
    setSearchTerms(newSearchTerms);
    const newShowDropdown = [...showDropdown];
    newShowDropdown[index] = true;
    setShowDropdown(newShowDropdown);
    if (!e.target.value) {
      const newDeductions = [...tempDeductions];
      newDeductions[index] = { menuItemId: '', reason: '', amount: 0 };
      setTempDeductions(newDeductions);
    }
  }}
  onFocus={() => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = newSearchTerms[index] || deduction.reason || '';
    setSearchTerms(newSearchTerms);
    const newShowDropdown = [...showDropdown];
    newShowDropdown[index] = true;
    setShowDropdown(newShowDropdown);
  }}
  onBlur={() => {
    setTimeout(() => {
      const newShowDropdown = [...showDropdown];
      newShowDropdown[index] = false;
      setShowDropdown(newShowDropdown);
    }, 200);
  }}
/>
{searchTerms[index] && showDropdown[index] && (
  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {allMenuItems
      .filter(item => item.name.toLowerCase().includes(searchTerms[index].toLowerCase()))
      .slice(0, 5)
      .map(item => (
        <div
          key={item.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base md:text-lg"
          onClick={() => {
            const newDeductions = [...tempDeductions];
            newDeductions[index] = {
              menuItemId: item.id,
              reason: item.name,
              amount: item.price * 0.5
            };
            setTempDeductions(newDeductions);
            const newSearchTerms = [...searchTerms];
            newSearchTerms[index] = item.name;
            setSearchTerms(newSearchTerms);
            const newShowDropdown = [...showDropdown];
            newShowDropdown[index] = false;
            setShowDropdown(newShowDropdown);
          }}
        >
          {item.name} - {formatCurrency(item.price * 0.5)}
        </div>
      ))}
    {searchTerms[index] && !allMenuItems.some(item => item.name.toLowerCase() === searchTerms[index].toLowerCase()) && (
      <div
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base md:text-lg"
        onClick={() => {
          const newDeductions = [...tempDeductions];
          newDeductions[index] = {
            menuItemId: '',
            reason: searchTerms[index],
            amount: 0
          };
          setTempDeductions(newDeductions);
          const newShowDropdown = [...showDropdown];
          newShowDropdown[index] = false;
          setShowDropdown(newShowDropdown);
        }}
      >
        Thêm lý do tùy chỉnh: "{searchTerms[index]}"
      </div>
    )}
  </div>
)}
                </div>
                <input
                  type="number"
                  className="p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-1/3 text-base md:text-lg bg-gray-50"
                  value={deduction.amount || ''}
                  placeholder="Nhập số tiền"
                  onChange={(e) => {
                    const newDeductions = [...tempDeductions];
                    newDeductions[index] = {
                      ...newDeductions[index],
                      amount: parseFloat(e.target.value) || 0
                    };
                    setTempDeductions(newDeductions);
                  }}
                />
                <button
                  className="text-red-600 hover:text-red-700 font-medium text-base md:text-lg"
                  onClick={() => {
                    const newDeductions = tempDeductions.filter((_, i) => i !== index);
                    setTempDeductions(newDeductions);
                    const newSearchTerms = searchTerms.filter((_, i) => i !== index);
                    setSearchTerms(newSearchTerms);
                  }}
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-base md:text-lg flex items-center gap-2"
              onClick={() => {
                setTempDeductions([...tempDeductions, { menuItemId: '', reason: '', amount: 0 }]);
                setSearchTerms([...searchTerms, '']);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Thêm khoản trừ
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button
          className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-base md:text-lg"
          onClick={() => {
            setEditRecord(null);
            setTempDeductions([]);
            setSearchTerms([]);
          }}
        >
          Hủy
        </button>
        <button
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-base md:text-lg"
          onClick={() => handleSaveEdit()}
        >
          Lưu
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
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-100">
              <h3 className="text-xl font-semibold mb-6">Chi tiết thưởng</h3>
              {filteredRecords.flatMap(r => r.bonuses.map(b => ({ checkIn: r.checkIn, ...b }))).length === 0 ? (
                <p className="text-gray-500">Chưa có khoản thưởng.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="text-sm min-w-[600px]">
                    <div className="grid grid-cols-3 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-lg">
                      <span>Ngày</span>
                      <span>Lý do</span>
                      <span>Số tiền</span>
                    </div>
                    {filteredRecords
                      .flatMap(r => r.bonuses.map(b => ({ checkIn: r.checkIn, ...b })))
                      .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
                      .map((b, index) => (
                        <div key={`${b.checkIn}-${b.reason}-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b hover:bg-gray-50">
                          <span>{b.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                          <span>{b.reason}</span>
                          <span>{formatCurrency(b.amount)}</span>
                        </div>
                      ))}
                  </div>
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
            <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-2xl border border-gray-100">
              <h3 className="text-xl font-semibold mb-6">Chi tiết trừ</h3>
              {filteredRecords.flatMap(r => r.deductions.map(d => ({ checkIn: r.checkIn, ...d }))).length === 0 ? (
                <p className="text-gray-500">Chưa có khoản trừ.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="text-sm min-w-[600px]">
                    <div className="grid grid-cols-3 gap-4 p-3 font-semibold border-b bg-gray-50 rounded-t-lg">
                      <span>Ngày</span>
                      <span>Lý do</span>
                      <span>Số tiền</span>
                    </div>
                    {filteredRecords
                      .flatMap(r => r.deductions.map(d => ({ checkIn: r.checkIn, ...d })))
                      .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
                      .map((d, index) => (
                        <div key={`${d.checkIn}-${d.reason}-${index}`} className="grid grid-cols-3 gap-4 p-3 border-b hover:bg-gray-50">
                          <span>{d.checkIn.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$3/$2/$1')}</span>
                          <span>{d.reason}</span>
                          <span>{formatCurrency(d.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetPage;
