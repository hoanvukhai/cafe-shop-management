import React from 'react';

interface Item {
  dish_id: string;
  dish_name: string;
  quantity: number;
}

interface Order {
  created_at: string;
  items: { [key: string]: Item };
}

interface MenuEditTabProps {
  orders: Order[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const MenuEditTab: React.FC<MenuEditTabProps> = ({ orders, filterType, filterDate }) => {
  const getMenuEditData = () => {
    const dishCounts: { [dish_id: string]: { name: string; count: number; quantity: number } } = {};
    orders
      .filter((order) => {
        const orderDate = order.created_at.slice(0, 10).replace(/-/g, '');
        if (filterType === 'day') return orderDate === filterDate;
        if (filterType === 'week') {
          const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return (
            orderDate >= weekStart.toISOString().slice(0, 10).replace(/-/g, '') &&
            orderDate <= weekEnd.toISOString().slice(0, 10).replace(/-/g, '')
          );
        }
        if (filterType === 'month') return orderDate.startsWith(filterDate.slice(0, 6));
        return orderDate.startsWith(filterDate.slice(0, 4));
      })
      .forEach((order) => {
        if (order.items) {
          Object.values(order.items).forEach((item) => {
            if (item.dish_id && item.dish_name && item.quantity) {
              dishCounts[item.dish_id] = {
                name: item.dish_name,
                count: (dishCounts[item.dish_id]?.count || 0) + 1,
                quantity: (dishCounts[item.dish_id]?.quantity || 0) + item.quantity,
              };
            }
          });
        }
      });

    return Object.entries(dishCounts)
      .map(([dish_id, data]) => ({ dish_id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  const menuEditData = getMenuEditData();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chỉnh Sửa Menu</h2>
      {menuEditData.length === 0 ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Món</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Số lần được chọn</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Tổng số lượng</th>
              </tr>
            </thead>
            <tbody>
              {menuEditData.map((dish) => (
                <tr key={dish.dish_id} className="border-t">
                  <td className="px-4 py-2 text-sm">{dish.name}</td>
                  <td className="px-4 py-2 text-sm">{dish.count}</td>
                  <td className="px-4 py-2 text-sm">{dish.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MenuEditTab;