import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Item {
  dish_id: string;
  price: number;
  quantity: number;
  status: string;
}

interface Order {
  created_at: string;
  items: { [key: string]: Item };
  order_status: string;
  paid_at?: string;
}

interface RevenueTabProps {
  orders: Order[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const RevenueTab: React.FC<RevenueTabProps> = ({ orders, filterType, filterDate }) => {
  const getRevenueData = () => {
    let timeRange: string[] = [];
    if (filterType === 'day') {
      timeRange = [filterDate];
    } else if (filterType === 'week') {
      timeRange = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        date.setDate(date.getDate() - date.getDay() + i);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else if (filterType === 'month') {
      const [year, month] = filterDate.match(/(\d{4})(\d{2})/)!.slice(1);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      timeRange = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(`${year}-${month}-${(i + 1).toString().padStart(2, '0')}`);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      });
    } else {
      timeRange = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(Number(filterDate.slice(0, 4)), i, 1);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      });
    }

    const filteredOrders = orders.filter((order) => {
      const orderDate = order.created_at.slice(0, 10).replace(/-/g, '');
      if (order.order_status === 'completed' && order.paid_at) {
        if (filterType === 'year') return orderDate.startsWith(filterDate.slice(0, 4));
        if (filterType === 'month') return orderDate.startsWith(filterDate.slice(0, 6));
        return timeRange.includes(orderDate);
      }
      return false;
    });

    const revenueData = timeRange.map((time) => {
      const ordersInTime = filteredOrders.filter((order) => {
        const orderDate = order.created_at.slice(0, 10).replace(/-/g, '');
        if (filterType === 'year') return orderDate.startsWith(time);
        return orderDate === time;
      });
      return ordersInTime.reduce((sum, order) => {
        if (order.items) {
          return sum + Object.values(order.items).reduce((s, item) => {
            if (item.price && item.quantity && item.status === 'served') {
              return s + item.quantity * item.price;
            }
            return s;
          }, 0);
        }
        return sum;
      }, 0);
    });

    return {
      labels: filterType === 'year' ? timeRange.map((t) => t.slice(4, 6)) : timeRange.map((t) => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: [
        {
          label: 'Doanh thu (K)',
          data: revenueData.map((r) => r / 1000),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    };
  };

  const revenueData = getRevenueData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Doanh Thu</h2>
      {revenueData.datasets[0].data.every((d) => d === 0) ? (
        <p className="text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <Line data={revenueData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
};

export default RevenueTab;