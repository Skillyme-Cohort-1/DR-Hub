import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import HomePage from './app/pages/HomePage';
import { LoginPage } from './app/pages/LoginPage';
import { RegisterPage } from './app/pages/RegisterPage';
import { BookingPage } from './app/pages/BookingPage';
import { BookingPaymentPage } from './app/pages/BookingPaymentPage';
import { BookingSuccessPage } from './app/pages/BookingSuccessPage';
import { ClientDashboard } from './app/pages/ClientDashboardPage';
import { Toaster } from "@/components/ui/sonner"
import ContactPage from './app/pages/ContactPage';

function isAuthenticated() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function PrivateRoute({ children }) {
  const location = useLocation();
  if (isAuthenticated()) return children;
  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
}

function PublicOnlyRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right"/>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking/pay"
          element={
            <PrivateRoute>
              <BookingPaymentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking/success"
          element={
            <PrivateRoute>
              <BookingSuccessPage />
            </PrivateRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}