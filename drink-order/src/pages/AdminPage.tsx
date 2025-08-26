import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ref, onValue } from 'firebase/database';
import TimesheetAdminPage from '../components/admin/Timesheet';
import BestSellerTab from '../components/admin/BestSellerTab';
import RevenueTab from '../components/admin/RevenueTab';
import WorkingHoursTab from '../components/admin/WorkingHoursTab';
import PeakTimeTab from '../components/admin/PeakTimeTab';
import MenuEditTab from '../components/admin/MenuEditTab';
import { users } from '../data/users';

interface Item {
  dish_id: string;
  dish_name: string;
  item_id: string;
  note: string;
  price: number;
  quantity: number;
  status: string;
}

interface Order {
  created_at: string;
  items: { [key: string]: Item };
  order_status: string;
  table_number: string;
}

interface TimesheetRecord {
  userId: string;
  userName: string;
  checkIn: string;
  checkOut: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timesheet' | 'bestseller' | 'revenue' | 'hours' | 'peaktime' | 'menu'>('timesheet');
  const [orders, setOrders] = useState<Order[]>([]);
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'day' | 'week' | 'month' | 'year' | 'range'>('day');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      setOrders(data ? Object.values(data) : []);
    });

    const recordsRef = ref(db, 'timesheet_data/records');
    const unsubscribeRecords = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      setRecords(data ? Object.values(data) : []);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRecords();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Trang Quản Lý</h1>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'timesheet'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('timesheet')}
          >
            Chấm Công
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'bestseller'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('bestseller')}
          >
            Món Best-Seller
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'revenue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('revenue')}
          >
            Doanh Thu
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'hours'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('hours')}
          >
            Giờ Làm Việc
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'peaktime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('peaktime')}
          >
            Giờ Đông Khách
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-semibold rounded-lg ${
              activeTab === 'menu'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition`}
            onClick={() => setActiveTab('menu')}
          >
            Chỉnh Sửa Menu
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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
            <div className="flex items-center gap-2 flex-1">
              <label className="font-medium text-sm">Tên:</label>
              <select
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">Tất cả</option>
                {users.filter((u) => u.role === 'employee').map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            {filterType !== 'all' && filterType !== 'range' && (
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
            )}
            {filterType === 'range' && (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <label className="font-medium text-sm">Từ:</label>
                  <input
                    type="date"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    value={startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''}
                    onChange={(e) => setStartDate(e.target.value.replace(/-/g, ''))}
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="font-medium text-sm">Đến:</label>
                  <input
                    type="date"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    value={endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''}
                    onChange={(e) => setEndDate(e.target.value.replace(/-/g, ''))}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          {activeTab === 'timesheet' && (
            <TimesheetAdminPage
              filterType={filterType}
              filterDate={filterDate}
              startDate={startDate}
              endDate={endDate}
              filterUser={filterUser}
            />
          )}
          {/* {activeTab === 'bestseller' && (
            <BestSellerTab orders={orders} filterType={filterType} filterDate={filterDate} startDate={startDate} endDate={endDate} />
          )}
          {activeTab === 'revenue' && (
            <RevenueTab orders={orders} filterType={filterType} filterDate={filterDate} startDate={startDate} endDate={endDate} />
          )}
          {activeTab === 'hours' && (
            <WorkingHoursTab records={records} filterType={filterType} filterDate={filterDate} startDate={startDate} endDate={endDate} />
          )}
          {activeTab === 'peaktime' && (
            <PeakTimeTab orders={orders} filterType={filterType} filterDate={filterDate} startDate={startDate} endDate={endDate} />
          )}
          {activeTab === 'menu' && (
            <MenuEditTab orders={orders} filterType={filterType} filterDate={filterDate} startDate={startDate} endDate={endDate} />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;