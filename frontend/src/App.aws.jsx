import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MockHome from './components/MockHome'
import MockPDP from './components/MockPDP'
import MatchMap from './components/MatchMap/MatchMap.aws'
import Chatbot from './components/Chatbot/Chatbot.aws'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MockHome />} />
        <Route path="/matchmap" element={<MatchMap />} />
        <Route path="/p/:productName/:productId" element={<MockPDP />} />
      </Routes>
      <Chatbot />
    </Router>
  )
}

export default App
