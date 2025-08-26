import React from 'react';
import { Line } from 'react-chartjs-2';

interface TimesheetRecord {
  userId: string;
  userName: string;
  checkIn: string;
  checkOut: string;
}

interface WorkingHoursTabProps {
  records: TimesheetRecord[];
  filterType: 'day' | 'week' | 'month' | 'year';
  filterDate: string;
}

const WorkingHoursTab: React.FC<WorkingHoursTabProps> = ({ records, filterType, filterDate }) => {
  const parseTimestamp = (ts: string) => {
    const [date, time] = ts.split('_');
    return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`);
  };

  const getTotalWorkingHours = () => {
    const totalHours = records
      .filter((record) => {
        const recordDate = record.checkIn.slice(0, 8);
        if (filterType === 'day') return recordDate === filterDate;
        if (filterType === 'week') {
          const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return (
            recordDate >= weekStart.toISOString().slice(0, 10).replace(/-/g, '') &&
            recordDate <= weekEnd.toISOString().slice(0, 10).replace(/-/g, '')
          );
        }
        if (filterType === 'month') return recordDate.startsWith(filterDate.slice(0, 6));
        return recordDate.startsWith(filterDate.slice(0, 4));
      })
      .reduce((sum, record) => {
        if (record.checkOut) {
          const checkInTime = parseTimestamp(record.checkIn);
          const checkOutTime = parseTimestamp(record.checkOut);
          const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

    return totalHours.toFixed(2);
  };

  const getDailyWorkingHours = () => {
    const userHours: { [userId: string]: { userName: string; hours: { [date: string]: number } } } = {};
    records
      .filter((record) => {
        const recordDate = record.checkIn.slice(0, 8);
        if (filterType === 'day') return recordDate === filterDate;
        if (filterType === 'week') {
          const date = new Date(filterDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return (
            recordDate >= weekStart.toISOString().slice(0, 10).replace(/-/g, '') &&
            recordDate <= weekEnd.toISOString().slice(0, 10).replace(/-/g, '')
          );
        }
        if (filterType === 'month') return recordDate.startsWith(filterDate.slice(0, 6));
        return recordDate.startsWith(filterDate.slice(0, 4));
      })
      .forEach((record) => {
        if (record.checkOut) {
          const recordDate = record.checkIn.slice(0, 8);
          const checkInTime = parseTimestamp(record.checkIn);
          const checkOutTime = parseTimestamp(record.checkOut);
          const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          if (!userHours[record.userId]) {
            userHours[record.userId] = { userName: record.userName, hours: {} };
          }
          userHours[record.userId].hours[recordDate] = (userHours[record.userId].hours[recordDate] || 0) + hours;
        }
      });

    return Object.entries(userHours).map(([userId, data]) => ({
      userId,
      userName: data.userName,
      hours: data.hours,
    }));
  };

  const getWorkingHoursTrend = () => {
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

    const hoursData = timeRange.map((time) => {
      return records
        .filter((record) => {
          const recordDate = record.checkIn.slice(0, 8);
          if (filterType === 'year') return recordDate.startsWith(time);
          return recordDate === time;
        })
        .reduce((sum, record) => {
          if (record.checkOut) {
            const checkInTime = parseTimestamp(record.checkIn);
            const checkOutTime = parseTimestamp(record.checkOut);
            return sum + (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          }
          return sum;
        }, 0);
    });

    return {
      labels: filterType === 'year' ? timeRange.map((t) => t.slice(4, 6)) : timeRange.map((t) => t.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')),
      datasets: [{
        label: 'Giờ làm việc',
        data: hoursData,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1,
      }],
    };
  };

  const dailyWorkingHours = getDailyWorkingHours();
  const workingHoursTrend = getWorkingHoursTrend();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Giờ Làm Việc</h2>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Tổng số giờ làm: {getTotalWorkingHours()} giờ</h3>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Giờ làm mỗi ngày</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Nhân viên</th>
                {dailyWorkingHours.length > 0 &&
                  Object.keys(dailyWorkingHours[0].hours).map((date) => (
                    <th key={date} className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                      {date.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2')}
                    </th>
                  ))}
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {dailyWorkingHours.map((user) => (
                <tr key={user.userId} className="border-t">
                  <td className="px-4 py-2 text-sm">{user.userName}</td>
                  {Object.keys(user.hours).map((date) => (
                    <td key={date} className="px-4 py-2 text-sm">{user.hours[date].toFixed(2)}</td>
                  ))}
                  <td className="px-4 py-2 text-sm">
                    {Object.values(user.hours).reduce((sum, h) => sum + h, 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Xu hướng giờ làm</h3>
        {workingHoursTrend.datasets[0].data.every((d) => d === 0) ? (
          <p className="text-gray-500">Chưa có dữ liệu.</p>
        ) : (
          <Line data={workingHoursTrend} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        )}
      </div>
    </div>
  );
};

export default WorkingHoursTab;