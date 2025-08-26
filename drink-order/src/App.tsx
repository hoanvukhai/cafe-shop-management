import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BartenderPage from './pages/BartenderPage';
import ManagerPage from './pages/ManagerPage';
import PreparationPage from './pages/PreparationPage';
import RecipesPage from './pages/RecipesPage';
import DailyTasksPage from './pages/DailyTasksPage';
import TimesheetPage from './pages/TimesheetPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import OrderPage from './pages/OrderPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <main className="min-h-screen bg-gray-100">
        <Routes>
        <Route path="/bartender" element={<BartenderPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/preparation" element={<PreparationPage />} />
        <Route path="/recipe" element={<RecipesPage />} />
        <Route path="/" element={<OrderPage />} />
        <Route path="/daily-tasks" element={<DailyTasksPage />} />
        <Route path="/timesheet" element={<TimesheetPage />} />
        {/* <Route path="/timesheet-admin" element={<TimesheetAdminPage />} /> */}

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/barista" element={<BaristaPage />} /> */}
        <Route path="/order" element={<OrderPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;