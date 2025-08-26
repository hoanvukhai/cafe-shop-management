import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, update, runTransaction } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { tables } from '../../data/tables';
import { menu_items, MenuItem } from '../../data/menu_items';

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

interface OrderFormProps {
  onClose: () => void;
  table: string;
  existingOrder?: Order;
}

const allMenuItems: MenuItem[] = Object.values(menu_items).flat();

const OrderForm: React.FC<OrderFormProps> = ({ onClose, table, existingOrder }) => {
  const [tableNumber, setTableNumber] = useState(table);
  const [orderNote, setOrderNote] = useState(existingOrder?.note || '');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItemData[]>(existingOrder?.items || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  const handleSaveOrder = async () => {
    if (!tableNumber) {
      alert('Vui lòng chọn bàn!');
      return;
    }
    if (currentOrderItems.length === 0) {
      alert('Vui lòng thêm ít nhất một món!');
      return;
    }
    if (currentOrderItems.some((item) => !item.dish_id || !item.dish_name || !item.price || !item.quantity || !item.status)) {
      alert('Dữ liệu món không đầy đủ!');
      return;
    }

    const firebaseItems = currentOrderItems.reduce((acc, item, index) => ({
      ...acc,
      [`item_${index + 1}`]: { ...item },
    }), {});
    const now = new Date().toISOString();

    if (existingOrder) {
      await update(ref(db, `orders/${existingOrder.order_id}`), {
        table_number: tableNumber,
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
        table_number: tableNumber,
        created_at: now,
        modified_at: now,
        order_status: 'pending',
        note: orderNote,
        items: firebaseItems,
      });
    }

    setCurrentOrderItems([]);
    setTableNumber('');
    setOrderNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          {existingOrder ? 'Thêm Món Vào Đơn' : 'Tạo Đơn Hàng Mới'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số bàn</label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={!!table}
            >
              <option value="">Chọn bàn</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng</label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Ghi chú (VD: Tầng 2, Ngoài trời)"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Chọn Món</h3>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {isDropdownOpen && filteredMenu.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <p className="text-gray-500 text-sm">Không tìm thấy món.</p>
                </div>
              )}
            </div>
            {selectedItem && (
              <div className="mt-4 space-y-3">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Nhập giá (VD: 30000)"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">{selectedItem.price.toLocaleString('vi-VN')}</div>
                )}
                <label className="block text-sm font-medium text-gray-700">Số lượng:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <label className="block text-sm font-medium text-gray-700">Ghi chú món:</label>
                <input
                  type="text"
                  placeholder="Ghi chú (VD: ít đá, thêm đường)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleAddOrderItem}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Thêm Món
                </button>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Món trong đơn:</h3>
            {currentOrderItems.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có món nào.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3">
                {currentOrderItems
                  .sort((a, b) => (a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0))
                  .map((item) => (
                    <div
                      key={item.item_id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex flex-wrap break-words">
                        {item.dish_name} - {item.price.toLocaleString('vi-VN')} x {item.quantity}
                        {item.note && <span className="italic ml-2"> (Ghi chú: {item.note})</span>}
                        <span className="ml-2 text-xs text-gray-500">
                          [{item.status === 'pending' ? 'Đang chờ' : item.status === 'prepared' ? 'Đã chuẩn bị' : 'Đã phục vụ'}]
                        </span>
                      </div>
                      {item.status === 'pending' && (
                        <div className="flex space-x-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => handleAdjustQuantity(item.item_id, 1)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleAdjustQuantity(item.item_id, -1)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.item_id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={!tableNumber || currentOrderItems.length === 0}
              className={`py-3 px-6 rounded-lg text-white text-sm font-medium ${
                !tableNumber || currentOrderItems.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } transition`}
            >
              Lưu Đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;