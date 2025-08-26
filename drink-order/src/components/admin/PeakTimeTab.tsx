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

interface PeakTimeTabProps {
  orders: Order[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const PeakTimeTab: React.FC<PeakTimeTabProps> = ({ orders, filterType, filterDate }) => {
  const getPeakTimeData = () => {
    const hourCounts: { [hour: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i.toString().padStart(2, '0')] = 0;
    }
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
        const hour = new Date(order.created_at).getHours().toString().padStart(2, '0');
        if (order.items) {
          Object.values(order.items).forEach((item) => {
            if (item.quantity && item.status === 'served') {
              hourCounts[hour] = (hourCounts[hour] || 0) + item.quantity;
            }
          });
        }
      });

    return {
      labels: Object.keys(hourCounts).map((h) => `${h}:00`),
      datasets: [{
        label: 'Số lượng món phục vụ',
        data: Object.values(hourCounts),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }],
    };
  };

  const peakTimeData = getPeakTimeData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Giờ Đông Khách</h2>
      {peakTimeData.datasets[0].data.every((d) => d === 0) ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <Bar data={peakTimeData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
};

export default PeakTimeTab;