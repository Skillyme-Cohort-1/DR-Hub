import { useState } from 'react'
import './App.css';


import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './app/pages/HomePage';

import { LandingPage } from './app/pages/LandingPage'
import { LoginPage } from './app/pages/LoginPage'
import { RegisterPage } from './app/pages/RegisterPage'
import { BookingPage } from './app/pages/BookingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  )
}