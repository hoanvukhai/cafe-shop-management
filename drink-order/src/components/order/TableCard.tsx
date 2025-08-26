import React, { useEffect, useState } from 'react';

interface OrderItemData {
  item_id: string;
  dish_id: string;
  dish_name: string;
  price: number;
  quantity: number;
  note: string;
  status: 'pending' | 'prepared' | 'served';
  served_at?: string;
}

interface Order {
  order_id: string;
  sequence_number: string;
  table_number: string;
  created_at: string;
  modified_at?: string;
  completed_at?: string;
  paid_at?: string;
  canceled_at?: string;
  order_status: 'pending' | 'completed' | 'canceled';
  note: string;
  items: OrderItemData[];
}

interface TableCardProps {
  table: string;
  totalOrders: number;
  totalPrice: number;
  hasPending: boolean;
  oldestOrder?: Order;
  onClick: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, totalOrders, totalPrice, hasPending, oldestOrder, onClick }) => {
  const [timeElapsed, setTimeElapsed] = useState('');

  useEffect(() => {
    if (!oldestOrder?.created_at) return;

    const updateTimer = () => {
      const createdTime = new Date(oldestOrder.created_at).getTime();
      const now = new Date().getTime();
      const diff = now - createdTime;
      const hours = Math.floor(diff / 3600000); // 3600000 ms = 1 hour
      const minutes = Math.floor((diff % 3600000) / 60000); // Remaining minutes
      const seconds = Math.floor((diff % 60000) / 1000); // Remaining seconds

      // Build the time string: include hours only if >= 1
      const timeString = hours >= 1 
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${minutes}m ${seconds}s`;
      setTimeElapsed(timeString);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [oldestOrder]);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg shadow-md border cursor-pointer transition-all duration-200 ${
        hasPending ? 'bg-red-50 border-red-300 hover:bg-red-100' : 'bg-white border-gray-200 hover:bg-gray-100'
      }`}
    >
      <h3 className="text-base font-semibold text-gray-900">{table}</h3>
      <p className="text-xs text-gray-600">{oldestOrder?.note || '-'}</p>
      <p className="text-xs text-gray-600">{oldestOrder?.sequence_number || 'Chưa có đơn hàng'}</p>
      <p className="text-xs text-gray-600">{totalPrice.toLocaleString('vi-VN')} VNĐ</p>
      {hasPending && (
        <p className="text-xs text-red-600 font-medium">{timeElapsed}</p>
      )}
    </div>
  );
};

export default TableCard;
