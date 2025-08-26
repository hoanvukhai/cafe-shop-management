import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { tables } from '../data/tables';
import TableCard from '../components/order/TableCard';
import TableDetail from '../components/order/TableDetail';

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

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const newOrders: Order[] = [];
      if (data) {
        Object.entries(data).forEach(([key, order]: [string, any]) => {
          if (order.order_status === 'pending') {
            const itemsArray = Object.keys(order.items || {}).map((itemKey) => ({
              ...order.items[itemKey],
              item_id: itemKey,
            }));
            newOrders.push({ ...order, order_id: key, items: itemsArray });
          }
        });
      }
      setOrders(newOrders.sort((a, b) => a.created_at.localeCompare(b.created_at)));
    });
    return () => unsubscribe();
  }, []);

  const getTableData = (table: string) => {
    const tableOrders = orders.filter((order) => order.table_number === table && order.order_status === 'pending');
    const totalOrders = tableOrders.length;
    const totalPrice = tableOrders.reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => {
        if (item.price && item.quantity) return s + item.price * item.quantity;
        return s;
      }, 0);
    }, 0);
    return { totalOrders, totalPrice, hasPending: totalOrders > 0, oldestOrder: tableOrders[0] };
  };

  const handleTableClick = (table: string) => {
    setSelectedTable(table);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Quản Lý Đơn Hàng</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table}
              table={table}
              {...getTableData(table)}
              onClick={() => handleTableClick(table)}
            />
          ))}
        </div>
        {selectedTable && (
          <TableDetail
            table={selectedTable}
            orders={orders.filter((o) => o.table_number === selectedTable && o.order_status === 'pending')}
            onClose={() => setSelectedTable(null)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderPage;
