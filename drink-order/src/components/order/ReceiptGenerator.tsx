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

interface ReceiptGeneratorProps {
  orders: Order[];
  table: string;
  totalPrice: number;
  isPayment: boolean;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ orders, table, totalPrice, isPayment }) => {
  const title = isPayment ? 'HÓA ĐƠN THANH TOÁN' : 'HÓA ĐƠN TẠM';
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '80mm',
        padding: '10px',
        fontSize: '12px',
        lineHeight: '1.3',
      }}
    >
      <style>
        {`
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
        `}
      </style>
      <h2 style={{ fontSize: '16px', textAlign: 'center', margin: '8px 0' }}>{title}</h2>
      <p style={{ margin: '4px 0', textAlign: 'center' }}>Ngày: {now}</p>
      <p style={{ margin: '4px 0', textAlign: 'center' }}>Bàn: {table}</p>
      <hr style={{ margin: '8px 0', border: '0.5px solid black' }} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px' }}>Món</th>
            <th style={{ textAlign: 'right', padding: '4px' }}>SL</th>
            <th style={{ textAlign: 'right', padding: '4px' }}>Giá</th>
            <th style={{ textAlign: 'right', padding: '4px' }}>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {orders.flatMap((order) =>
            order.items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <tr key={item.item_id}>
                  <td style={{ padding: '4px', maxWidth: '40mm', wordWrap: 'break-word' }}>
                    {item.dish_name}{item.note ? ` (${item.note})` : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{item.price.toLocaleString('vi-VN')}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{itemTotal.toLocaleString('vi-VN')}</td>
                </tr>
              );
            })
          )}
          {orders.map((order) => (
            order.note && (
              <tr key={order.order_id}>
                <td colSpan={4} style={{ padding: '4px', fontStyle: 'italic', fontSize: '10px' }}>
                  Ghi chú: {order.note}
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
      <hr style={{ margin: '8px 0', border: '0.5px solid black' }} />
      <p style={{ textAlign: 'right', fontWeight: 'bold', margin: '8px 0', fontSize: '12px' }}>
        Tổng cộng: {totalPrice.toLocaleString('vi-VN')} VNĐ
      </p>
    </div>
  );
};

export default ReceiptGenerator;