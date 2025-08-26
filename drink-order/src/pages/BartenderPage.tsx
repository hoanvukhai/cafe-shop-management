import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { recipes } from '../data/recipes';
import BartenderOrderCard from '../components/bartender/BartenderOrderCard';
import RecipeModal from '../components/bartender/RecipeModal';
import OrderForm from '../components/order/OrderForm';

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

interface Recipe {
  id: string;
  name: string;
  preparation: {
    steps: string[];
    serving_tools?: string[];
    notes?: string;
  };
}

const BartenderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'pending' | 'prepared'>('pending');
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const notificationSound = new Audio('/sounds/doorbell.mp3');

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const newOrders: Order[] = [];
      const today = new Date().toISOString().slice(0, 10);
      for (let key in data) {
        const order = data[key];
        if (order.canceled_at || order.order_status === 'completed') continue;
        if (order.created_at.slice(0, 10) !== today) continue;
        const itemsArray = Object.keys(order.items || {}).map((itemKey) => ({
          ...order.items[itemKey],
          item_id: itemKey,
        })).sort((a, b) => (a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0));
        newOrders.push({ ...order, order_id: key, items: itemsArray });
      }
      setOrders(newOrders.sort((a, b) => (b.modified_at || b.created_at).localeCompare(a.modified_at || a.created_at)));

      if (newOrders.length > lastOrderCount && isSoundEnabled) {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        } else {
          console.log('Vibration API không được hỗ trợ trên thiết bị này.');
        }
        notificationSound.play().catch((error) => {
          console.log('Lỗi khi phát âm thanh:', error);
        });
      }
      setLastOrderCount(newOrders.length);
    });

    return () => unsubscribeOrders();
  }, [lastOrderCount, isSoundEnabled]);

  const handleShowRecipe = (dishId: string) => {
    const recipe = recipes.recipes.find((r) => r.id === dishId);
    setSelectedRecipe(recipe || null);
    setIsRecipeModalOpen(true);
  };

  const handleOpenAddItemModal = (table: string) => {
    setSelectedTable(table);
    setIsOrderFormOpen(true);
  };

  const pendingOrders = orders
    .filter((order) => order.items.some((item) => item.status === 'pending'))
    .sort((a, b) => (b.modified_at || b.created_at).localeCompare(a.modified_at || a.created_at));
  const preparedOrders = orders
    .filter((order) => order.items.every((item) => item.status === 'prepared' || item.status === 'served'))
    .sort((a, b) => (b.modified_at || b.created_at).localeCompare(a.modified_at || a.created_at));

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #d1d5db;
            border-radius: 9999px;
            background-color: white;
            cursor: pointer;
            outline: none;
          }
          input[type="checkbox"]:checked {
            background-color: white;
            border-color: #1f2937;
          }
          input[type="checkbox"]:checked::after {
            content: '✔';
            display: block;
            text-align: center;
            color: black;
            font-size: 12px;
            line-height: 12px;
          }
          input[type="checkbox"]:focus {
            ring: 2px solid #3b82f6;
          }
        `}
      </style>
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pha Chế</h1>
        </div>

        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center text-sm sm:text-base font-semibold ${
              activeTab === 'pending'
                ? 'bg-blue-700 text-white border-b-2 border-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition rounded-t-lg`}
            onClick={() => setActiveTab('pending')}
          >
            Chưa Làm Xong ({pendingOrders.length})
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm sm:text-base font-semibold ${
              activeTab === 'prepared'
                ? 'bg-blue-700 text-white border-b-2 border-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition rounded-t-lg`}
            onClick={() => setActiveTab('prepared')}
          >
            Đã Làm Xong ({preparedOrders.length})
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          {activeTab === 'pending' ? 'Đơn Hàng Chưa Làm Xong' : 'Đơn Hàng Đã Làm Xong'}
        </h2>
        {(activeTab === 'pending' ? pendingOrders : preparedOrders).length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            Chưa có đơn hàng nào {activeTab === 'pending' ? 'chưa làm xong' : 'đã làm xong'}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'pending' ? pendingOrders : preparedOrders).map((order) => (
              <BartenderOrderCard
                key={order.order_id}
                order={order}
                onShowRecipe={handleShowRecipe}
                onAddItem={() => handleOpenAddItemModal(order.table_number)}
                activeTab={activeTab}
              />
            ))}
          </div>
        )}

        {isRecipeModalOpen && selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setIsRecipeModalOpen(false)}
          />
        )}

      {isOrderFormOpen && (
        <OrderForm
          onClose={() => {
            setIsOrderFormOpen(false);
            setSelectedTable(null);
          }}
          table={selectedTable || ''} // Use 'table' instead of 'defaultTable'
          existingOrder={selectedTable ? orders.find((o) => o.table_number === selectedTable && o.order_status === 'pending') : undefined} // Pass single pending order
        />
      )}
      </div>
    </div>
  );
};

export default BartenderPage;