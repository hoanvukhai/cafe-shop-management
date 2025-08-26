import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, update, runTransaction, push, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { menu_items, MenuItem } from '../../data/menu_items';
import { tables } from '../../data/tables';
import { FaPlus, FaMinus, FaTrash, FaClock, FaUtensils, FaCheckCircle, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import OrderList from './OrderList';
import ReceiptGenerator from './ReceiptGenerator';
import ReactDOMServer from 'react-dom/server';
import { AiOutlineMinusCircle , AiOutlinePlusCircle } from "react-icons/ai";

interface OrderItemData {
  item_id: string;
  dish_id: string;
  dish_name: string;
  price: number;
  quantity: number;
  note: string;
  status: 'pending' | 'prepared' | 'served';
  served_at?: string | null;
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

interface TableDetailProps {
  table: string;
  orders: Order[];
  onClose: () => void;
}

const allMenuItems: MenuItem[] = Object.values(menu_items).flat();

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  prepared: 'bg-green-50 text-green-600 border-green-200',
  served: 'bg-gray-50 text-gray-600 border-gray-200',
};

const statusIcons = {
  pending: <FaClock className="inline mr-1" />,
  prepared: <FaUtensils className="inline mr-1" />,
  served: <FaCheckCircle className="inline mr-1" />,
};

const TableDetail: React.FC<TableDetailProps> = ({ table, orders, onClose }) => {
  const [orderNote, setOrderNote] = useState(orders.find((o) => o.order_status === 'pending')?.note || '');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItemData[]>(orders.find((o) => o.order_status === 'pending')?.items || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [swapTable, setSwapTable] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const totalPrice = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const existingOrder = orders.find((o) => o.order_status === 'pending');
  const tableDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng dropdown tìm món
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Đóng dropdown tìm bàn
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
        setIsTableDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMenu = allMenuItems
    .filter((item) => item.available && item.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  const handleAddOrderItem = () => {
    if (!selectedItem) return;
    if (selectedItem.id === 'special_drinks_005' && (!customPrice || customPrice <= 0)) {
      alert('Vui lòng nhập giá cho món "Không rõ"!');
      return;
    }
    const price = selectedItem.id === 'special_drinks_005' ? customPrice! : selectedItem.price;
    const existingItemIndex = currentOrderItems.findIndex(
      (item) => item.dish_id === selectedItem.id && item.note === note && item.status === 'pending'
    );
    if (existingItemIndex >= 0) {
      const updatedItems = [...currentOrderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].price = price;
      setCurrentOrderItems(updatedItems);
    } else {
      const newItem: OrderItemData = {
        item_id: `item_${uuidv4().slice(0, 8)}`,
        dish_id: selectedItem.id,
        dish_name: selectedItem.name,
        price,
        quantity,
        note,
        status: 'pending',
      };
      setCurrentOrderItems([...currentOrderItems, newItem]);
    }
    setSelectedItem(null);
    setQuantity(1);
    setCustomPrice(null);
    setNote('');
    setSearch('');
    setIsDropdownOpen(false);
  };

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    const updatedItems = currentOrderItems.map((item) =>
      item.item_id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCurrentOrderItems(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này khỏi đơn hàng?')) return;
    const updatedItems = currentOrderItems.filter((item) => item.item_id !== itemId);
    setCurrentOrderItems(updatedItems);
  };

  const handleUpdateNote = async (itemId: string, newNote: string) => {
    const updatedItems = currentOrderItems.map((item) =>
      item.item_id === itemId ? { ...item, note: newNote } : item
    );
    setCurrentOrderItems(updatedItems);
    if (existingOrder) {
      const firebaseItems = updatedItems.reduce((acc, item, index) => ({
        ...acc,
        [`item_${index + 1}`]: { ...item },
      }), {});
      await update(ref(db, `orders/${existingOrder.order_id}`), {
        items: firebaseItems,
        modified_at: new Date().toISOString(),
      });
    }
  };

  const handleToggleServe = async (itemId: string, currentStatus: 'prepared' | 'served') => {
    const now = new Date().toISOString();
    if (currentStatus === 'prepared') {
      const updatedItems = currentOrderItems.map((item): OrderItemData =>
        item.item_id === itemId ? { ...item, status: 'served' as const, served_at: now } : item
      );
      setCurrentOrderItems(updatedItems);
      if (existingOrder) {
        const firebaseItems = updatedItems.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index + 1}`]: { ...item },
        }), {});
        await update(ref(db, `orders/${existingOrder.order_id}`), {
          items: firebaseItems,
          modified_at: now,
        });
      }
    } else if (currentStatus === 'served' && window.confirm('Bạn có chắc muốn đổi trạng thái món này về "Đã chuẩn bị"?')) {
      const updatedItems = currentOrderItems.map((item): OrderItemData =>
        item.item_id === itemId ? { ...item, status: 'prepared' as const, served_at: null } : item
      );
      setCurrentOrderItems(updatedItems);
      if (existingOrder) {
        const firebaseItems = updatedItems.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index + 1}`]: { ...item },
        }), {});
        await update(ref(db, `orders/${existingOrder.order_id}`), {
          items: firebaseItems,
          modified_at: now,
        });
      }
    }
  };

  const handleSwapTable = async () => {
    if (!swapTable || swapTable === table) {
      alert('Vui lòng chọn một bàn khác để đổi!');
      return;
    }

    const now = new Date().toISOString();
    const ordersSnapshot = await get(ref(db, 'orders'));
    const allOrders: Order[] = [];
    ordersSnapshot.forEach((child) => {
      allOrders.push(child.val());
    });
    const targetOrder = allOrders.find((o) => o.table_number === swapTable && o.order_status === 'pending');
    const currentOrder = existingOrder;

    if (!currentOrder) {
      alert('Không có đơn hàng đang chờ để đổi!');
      return;
    }

    const action = targetOrder ? 'đổi' : 'chuyển';
    if (!window.confirm(`Bạn có chắc muốn ${action} đơn hàng từ ${table} sang ${swapTable}?`)) {
      return;
    }

    const updates: { [key: string]: any } = {};
    updates[`orders/${currentOrder.order_id}/table_number`] = swapTable;
    updates[`orders/${currentOrder.order_id}/modified_at`] = now;

    if (targetOrder) {
      updates[`orders/${targetOrder.order_id}/table_number`] = table;
      updates[`orders/${targetOrder.order_id}/modified_at`] = now;
    }

    try {
      await update(ref(db), updates);
      alert(`Đã ${action} đơn hàng từ ${table} sang ${swapTable}!`);
      setSwapTable('');
      onClose();
    } catch (error) {
      console.error('Error swapping/moving tables:', error);
      alert('Lỗi khi đổi bàn, vui lòng thử lại!');
    }
  };

  const handleSaveOrder = async () => {
    if (currentOrderItems.length === 0) {
      alert('Vui lòng thêm ít nhất một món!');
      return;
    }
    const firebaseItems = currentOrderItems.reduce((acc, item, index) => ({
      ...acc,
      [`item_${index + 1}`]: { ...item },
    }), {});
    const now = new Date().toISOString();

    if (existingOrder) {
      await update(ref(db, `orders/${existingOrder.order_id}`), {
        note: orderNote,
        items: firebaseItems,
        modified_at: now,
      });
    } else {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const sequenceNumberRef = ref(db, `metadata/${today}/last_sequence_number`);
      const result = await runTransaction(sequenceNumberRef, (currentSequence: number | null) => {
        return (currentSequence || 0) + 1;
      });
      const sequenceNumber = `HD${today}-${result.snapshot.val().toString().padStart(4, '0')}`;
      const orderId = `order_${uuidv4().slice(0, 8)}`;

      await push(ref(db, 'orders'), {
        order_id: orderId,
        sequence_number: sequenceNumber,
        table_number: table,
        created_at: now,
        modified_at: now,
        order_status: 'pending',
        note: orderNote,
        items: firebaseItems,
      });
    }
    alert('Đơn hàng đã lưu!');
    onClose();
  };

  const handlePayAll = async () => {
    const hasPending = currentOrderItems.some((item) => item.status === 'pending');
    if (hasPending) {
      alert('Không thể thanh toán vì còn món đang chờ!');
      return;
    }
    if (!window.confirm('Xác nhận thanh toán tất cả đơn hàng?')) {
      return;
    }
    const now = new Date().toISOString();
    if (existingOrder) {
      await update(ref(db, `orders/${existingOrder.order_id}`), {
        order_status: 'completed',
        completed_at: now,
        paid_at: now,
      });
    }
    onClose();
  };

  const handlePrintTemporary = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa Đơn Tạm</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${ReactDOMServer.renderToString(<ReceiptGenerator orders={orders} table={table} totalPrice={totalPrice} isPayment={false} />)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintPayment = async () => {
    const hasPending = currentOrderItems.some((item) => item.status === 'pending');
    if (hasPending) {
      alert('Không thể in hóa đơn thanh toán vì còn món đang chờ!');
      return;
    }
    if (!window.confirm('Xác nhận in hóa đơn thanh toán và hoàn tất đơn hàng?')) {
      return;
    }
    const now = new Date().toISOString();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa Đơn Thanh Toán</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${ReactDOMServer.renderToString(<ReceiptGenerator orders={orders} table={table} totalPrice={totalPrice} isPayment={true} />)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    if (existingOrder) {
      await update(ref(db, `orders/${existingOrder.order_id}`), {
        order_status: 'completed',
        completed_at: now,
        paid_at: now,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{table}</h2>
          <div className="flex items-center space-x-2">
            <div className="relative" ref={tableDropdownRef}>
              <input
                type="text"
                placeholder="Tìm bàn..."
                value={swapTable}
                onChange={(e) => {
                  setSwapTable(e.target.value);
                  setIsTableDropdownOpen(true);
                }}
                onFocus={() => setIsTableDropdownOpen(true)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-transparent"
              />
              {isTableDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto bg-gray-50">
                  {tables
                    .filter((t) => t !== table && t.toLowerCase().includes(swapTable.toLowerCase()))
                    .slice(0, 40)
                    .map((t) => (
                      <div
                        key={t}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSwapTable(t);
                          setIsTableDropdownOpen(false);
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  {tables.filter((t) => t !== table && t.toLowerCase().includes(swapTable.toLowerCase())).length === 0 && swapTable && (
                    <div className="p-2 text-gray-500 text-sm">Không tìm thấy bàn.</div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleSwapTable}
              className="flex-1 sm:flex-none bg-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center justify-center"
              disabled={!swapTable}
            >
              Đổi Bàn trống<FaExchangeAlt className="ml-1 sm:ml-2" />
            </button>
          </div>
        </div>
        <div><p className="text-base font-medium text-gray-700">Hóa đơn số: {existingOrder?.sequence_number || 'Chưa có đơn hàng'}</p></div>
        <div className="mt-4 mb-8 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng</label>
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Ghi chú (VD: Tầng 2, Ngoài trời)"
          />
          <p className="text-sm font-semibold text-gray-800">Tổng giá: {totalPrice.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thêm Món</h3>
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isFormCollapsed ? 'Mở Form' : 'Thu Gọn'}
            </button>
          </div>
          {!isFormCollapsed && (
            <div className="">
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Tìm món..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-transparent"
                />
                {isDropdownOpen && filteredMenu.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto bg-gray-50">
                    {filteredMenu.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setSearch(item.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span>{item.name}</span>
                        <span>{item.id === 'special_drinks_005' ? 'Tùy chỉnh' : `${item.price.toLocaleString('vi-VN')}`}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isDropdownOpen && filteredMenu.length === 0 && search && (
                  <div className="absolute z-20 w-full mt-1 border border-gray-200 rounded-lg shadow-lg p-3 bg-gray-50">
                    <p className="text-gray-500 text-sm">Không tìm thấy món.</p>
                  </div>
                )}
              </div>
              {selectedItem && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-800">{selectedItem.name}</div>
                  {selectedItem.id === 'special_drinks_005' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ):</label>
                      <input
                        type="number"
                        value={customPrice || ''}
                        onChange={(e) => setCustomPrice(parseFloat(e.target.value) || null)}
                        min="0"
                        step="1000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nhập giá (VD: 30000)"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">{selectedItem.price.toLocaleString('vi-VN')}</div>
                  )}
                  <label className="block text-sm font-medium text-gray-700">Số lượng:</label>

                  <div className="flex items-center justify-between w-full mx-auto">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex" >                    
                      <button className="text-red-500 text-4xl font-bold active:scale-95 " onClick={() => setQuantity(q => Math.max(1, q - 1))}><AiOutlineMinusCircle  /></button>
                      <button className="text-green-500 text-4xl font-bold active:scale-95"onClick={() => setQuantity(q => q + 1)}><AiOutlinePlusCircle /></button>
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-700">Ghi chú món:</label>
                  <input
                    type="text"
                    placeholder="Ghi chú (VD: ít đá, thêm đường)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleAddOrderItem}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center"
                  >
                    Thêm Món <FaPlus className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Món trong đơn:</h3>
          {currentOrderItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có món nào.</p>
          ) : (
            <div className="space-y-4">
              {currentOrderItems
                .sort((a, b) => (a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0))
                .map((item) => (
                  <div
                    key={item.item_id}
                    className={`relative flex flex-col p-4 sm:p-5 border rounded-lg shadow-sm ${statusColors[item.status]} ${item.status === 'prepared' || item.status === 'served' ? 'cursor-pointer hover:bg-opacity-80' : ''
                      }`}
                    onClick={() => {
                      if (item.status === 'prepared' || item.status === 'served') {
                        handleToggleServe(item.item_id, item.status);
                      }
                    }}
                  >
                    <span className="absolute top-1 left-1 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded z-10">
                      x{item.quantity}
                    </span>
                    <span className={`absolute top-2 right-2 flex items-center text-xs font-medium ${statusColors[item.status].split(' ')[1]} z-10`}>
                      {statusIcons[item.status]}
                      {item.status === 'pending' ? 'Đang chờ' : item.status === 'prepared' ? 'Đã chuẩn bị' : 'Đã phục vụ'}
                    </span>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm font-medium text-gray-800">
                        {item.dish_name} - {item.price.toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    {item.status === 'pending' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleUpdateNote(item.item_id, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                          placeholder="Sửa ghi chú"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdjustQuantity(item.item_id, 1);
                          }}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdjustQuantity(item.item_id, -1);
                          }}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 text-sm flex items-center"
                        >
                          <FaMinus />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.item_id);
                          }}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 text-sm flex items-center"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 italic">Ghi chú: {item.note || '-'}</div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="">
          <div className="flex flex-row space-x-2 sm:space-x-4 flex-wrap gap-y-2 max-w-4xl mx-auto">
            <button
              onClick={handleSaveOrder}
              className="flex-1 sm:flex-none bg-green-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              Lưu Đơn
            </button>
            <button
              onClick={handlePrintTemporary}
              className="flex-1 sm:flex-none bg-yellow-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
            >
              In Tạm
            </button>
            <button
              onClick={handlePrintPayment}
              disabled={currentOrderItems.some((item) => item.status === 'pending')}
              className={`flex-1 sm:flex-none py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-white text-sm font-medium ${currentOrderItems.some((item) => item.status === 'pending') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              In Thanh Toán
            </button>
            <button
              onClick={handlePayAll}
              className="flex-1 sm:flex-none bg-green-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              Thanh Toán Tất Cả
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-700 transition text-sm font-medium flex items-center justify-center"
            >
              Hủy <FaTimes className="ml-1 sm:ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
