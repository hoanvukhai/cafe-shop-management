import React from 'react';
import { db } from '../../firebase';
import { ref, update, remove } from 'firebase/database';
import OrderItem from '../order/OrderItem';

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

interface BartenderOrderCardProps {
  order: Order;
  onShowRecipe: (dishId: string) => void;
  onAddItem: () => void;
  activeTab: 'pending' | 'prepared';
}

const statusLabels: Record<string, string> = {
  pending: 'Đang chờ ',
  prepared: 'Đã chuẩn bị ',
  served: 'Đã phục vụ ',
};

const BartenderOrderCard: React.FC<BartenderOrderCardProps> = ({ order, onShowRecipe, onAddItem, activeTab }) => {
  const handlePrepare = (itemId: string, checked: boolean) => {
    if (!checked && !window.confirm('Bạn có chắc muốn đặt lại món này thành chưa làm xong?')) return;
    update(ref(db, `orders/${order.order_id}/items/${itemId}`), {
      status: checked ? 'prepared' : 'pending',
    }).then(() => {
      update(ref(db, `orders/${order.order_id}`), {
        modified_at: new Date().toISOString(),
      });
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này khỏi đơn hàng?')) return;
    const orderRef = ref(db, `orders/${order.order_id}/items/${itemId}`);
    remove(orderRef).then(() => {
      if (order.items.length === 1) {
        update(ref(db, `orders/${order.order_id}`), {
          order_status: 'canceled',
          canceled_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        });
      } else {
        update(ref(db, `orders/${order.order_id}`), {
          modified_at: new Date().toISOString(),
        });
      }
    }).catch((error) => {
      console.error('Lỗi khi xóa món:', error);
    });
  };

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-gray-800 text-sm sm:text-base">
          Đơn {order.sequence_number} - {order.table_number}
        </div>
        {activeTab === 'pending' && (
          <button
            onClick={onAddItem}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-xs"
          >
            Thêm Món
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        Trạng thái: {statusLabels[order.order_status] || order.order_status}
        | Ghi chú: {order.note || 'Không có'}
        {order.paid_at && ` | Đã thanh toán`}
      </div>
      <div className="text-sm font-semibold text-gray-800 mb-2">
        Tổng: {total.toLocaleString('vi-VN')}
      </div>
      <div className="text-sm">
        {order.items.map((item) => (
          <div
            key={item.item_id}
            onClick={() => handlePrepare(item.item_id, item.status !== 'prepared')}
            className={`flex items-center space-x-2 p-2 border rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition relative z-10 bg-white ${
              item.status === 'prepared' ? 'line-through text-gray-500' : item.status === 'served' ? 'line-through text-gray-400' : ''
            }`}
          >
            {item.quantity > 1 && (
              <div className={`absolute top-0 left-0 text-white text-xs font-bold px-2 py-1 rounded z-20 max-w-[40px] ${item.quantity > 5 ? 'bg-purple-600' : 'bg-red-600'}`}>
                x{item.quantity}
              </div>
            )}
            <input
              type="checkbox"
              checked={item.status === 'prepared' || item.status === 'served'}
              onChange={(e) => handlePrepare(item.item_id, e.target.checked)}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
              disabled={item.status === 'served'}
            />
            <div className="flex-1 relative z-20">
              <OrderItem item={item} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowRecipe(item.dish_id);
              }}
              className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition text-xs relative z-20"
            >
              Chi tiết
            </button>
            {activeTab === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(item.item_id);
                }}
                className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition text-xs relative z-20"
              >
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BartenderOrderCard;