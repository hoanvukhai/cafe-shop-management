import React from 'react';
import OrderItem from './OrderItem';

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

interface OrderListProps {
  orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  // Since there's only one pending order per table, take the first order
  const order = orders[0];
  const items = order?.items || [];
  const totalPrice = items.reduce((sum, item) => {
    if (item.price && item.quantity) return sum + item.price * item.quantity;
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Chưa có món nào trong đơn hàng.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <OrderItem key={item.item_id} item={item} />
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="text-sm font-semibold text-gray-800 text-right">
          Tổng giá: {totalPrice.toLocaleString('vi-VN')} VNĐ
        </div>
      )}
    </div>
  );
};

export default OrderList;
