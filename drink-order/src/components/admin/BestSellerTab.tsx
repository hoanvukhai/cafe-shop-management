import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Item {
  dish_id: string;
  dish_name: string;
  quantity: number;
  status: string;
}

interface Order {
  created_at: string;
  items: { [key: string]: Item };
  order_status: string;
}

interface BestSellerTabProps {
  orders: Order[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const BestSellerTab: React.FC<BestSellerTabProps> = ({ orders, filterType, filterDate }) => {
  const getBestSellerData = () => {
    const itemCounts: { [dish_id: string]: { name: string; quantity: number } } = {};
    const filteredOrders = orders.filter((order) => {
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
    });

    console.log('Filtered orders for BestSeller:', filteredOrders);

    filteredOrders.forEach((order) => {
      if (order.items) {
        Object.values(order.items).forEach((item) => {
          if (item.dish_id && item.dish_name && item.quantity && item.status === 'served') {
            itemCounts[item.dish_id] = {
              name: item.dish_name,
              quantity: (itemCounts[item.dish_id]?.quantity || 0) + item.quantity,
            };
          }
        });
      }
    });

    console.log('Item counts:', itemCounts);

    const sortedItems = Object.entries(itemCounts)
      .map(([dish_id, data]) => ({ dish_id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      labels: sortedItems.map((item) => item.name),
      datasets: [
        {
          label: 'Số lượng bán',
          data: sortedItems.map((item) => item.quantity),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const bestSellerData = getBestSellerData();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Món Best-Seller</h2>
      {bestSellerData.labels.length === 0 ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <Bar data={bestSellerData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
};

export default BestSellerTab;