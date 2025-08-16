import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:spaceId" element={<ChatPage />} />
          <Route path="/chat/:spaceId/:conversationId" element={<ChatPage />} />
        </Routes>
      </Router>
  )
}

export default App
