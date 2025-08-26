import React from 'react';

interface OrderItemData {
  item_id: string;
  dish_id: string;
  dish_name: string;
  price: number;
  quantity: number;
  note: string;
  status: 'pending' | 'prepared' | 'served';
}

interface OrderItemProps {
  item: OrderItemData;
}

const statusLabels: Record<string, string> = {
  pending: 'Đang chờ',
  prepared: 'Đã chuẩn bị',
  served: 'Đã phục vụ',
};

const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  return (
    <div className="mb-3">
      <div className="text-sm font-medium text-gray-800">
        {item.dish_name} - {item.price.toLocaleString('vi-VN')} x {item.quantity}
      </div>
      {item.note && <div className="text-xs text-gray-600 italic mt-1">Ghi chú: {item.note}</div>}
      <div className="text-xs text-gray-500 mt-1">Trạng thái: {statusLabels[item.status]}</div>
    </div>
  );
};

export default OrderItem;