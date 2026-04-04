import { BrowserRouter, Routes, Route } from 'react-router'
import { ClientDashboard } from './app/pages/ClientDashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}