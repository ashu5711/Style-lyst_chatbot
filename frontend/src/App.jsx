import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MockHome from './components/MockHome'
import MockPDP from './components/MockPDP'
import Chatbot from './components/Chatbot/Chatbot'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MockHome />} />
        <Route path="/p/:productName/:productId" element={<MockPDP />} />
      </Routes>
      <Chatbot />
    </Router>
  )
}

export default App
