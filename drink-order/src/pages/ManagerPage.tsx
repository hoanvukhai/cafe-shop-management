import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, update, set } from 'firebase/database';
import Header from '../components/Header';

interface OrderItemData {
  item_id: string;
  dish_id: string;
  dish_name: string;
  price: number;
  quantity: number;
  note: string;
  status: 'pending' | 'prepared' | 'served';
}

interface Order {
  order_id: string;
  sequence_number: string; // Đổi thành string để lưu HDYYYYMMDD-XXXX
  table_number: string;
  created_at: string;
  completed_at: string | null;
  paid_at: string | null;
  canceled_at: string | null;
  order_status: 'pending' | 'completed' | 'canceled';
  note: string;
  items: OrderItemData[];
}

const ManagerPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const newOrders: Order[] = [];
      for (let key in data) {
        const order = data[key];
        const itemsArray = Object.keys(order.items || {}).map((itemKey) => ({
          ...order.items[itemKey],
          item_id: itemKey,
        }));
        newOrders.push({ ...order, order_id: key, items: itemsArray });
      }
      newOrders.sort((a, b) => a.sequence_number.localeCompare(b.sequence_number));
      setOrders(newOrders);
    });

    return () => unsubscribeOrders();
  }, []);

  const handleUpdateOrderStatus = (orderId: string, status: 'completed' | 'canceled') => {
    const order = orders.find((o) => o.order_id === orderId);
    if (order && order.paid_at) return;
    const updates: any = {};
    if (status === 'completed') {
      updates.order_status = 'completed';
      updates.completed_at = new Date().toISOString();
    } else if (status === 'canceled') {
      updates.order_status = 'canceled';
      updates.canceled_at = new Date().toISOString();
    }
    update(ref(db, `orders/${orderId}`), updates);
  };

  const handleResetOrders = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ đơn hàng và reset bộ đếm?')) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      set(ref(db, 'orders'), null); // Xóa toàn bộ node orders
      set(ref(db, `metadata/${today}/last_sequence_number`), 0); // Reset bộ đếm
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Quản Lý</h1>
        <button
          onClick={handleResetOrders}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
        >
          Xóa Tất Cả Đơn Hàng & Reset Bộ Đếm
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Danh Sách Đơn Hàng</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              return (
                <div
                  key={order.order_id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Đơn {order.sequence_number} - {order.table_number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    Trạng thái: {order.order_status}
                    {order.note && ` | Ghi chú: {order.note}`}
                    {order.paid_at && ` | Đã thanh toán`}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                    Tổng: {total / 1000}K
                  </div>
                  <div className="text-xs sm:text-sm">
                    {order.items.map((item) => (
                      <div key={item.item_id} className="mb-2">
                        <div className="font-medium text-gray-800">
                          {item.dish_name} - {item.price / 1000}K x {item.quantity}
                        </div>
                        {item.note && (
                          <div className="text-gray-600 italic">Ghi chú: {item.note}</div>
                        )}
                        <div className="text-gray-500">Trạng thái: {item.status}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-2 mt-2">
                    {!order.paid_at && order.order_status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.order_id, 'completed')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm"
                      >
                        Hoàn Thành Đơn
                      </button>
                    )}
                    {!order.paid_at && order.order_status !== 'canceled' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.order_id, 'canceled')}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
                      >
                        Hủy Đơn
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPage;