import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { HomePage } from './app/pages/HomePage'
import { LoginPage } from './app/pages/LoginPage'
import { ClientDashboard } from './app/pages/ClientDashboardPage'
import { NotFound } from './app/pages/NotFound'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
