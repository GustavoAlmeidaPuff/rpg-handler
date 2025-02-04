import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Initiative from './pages/Initiative';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/initiative" element={<Initiative />} />
      </Routes>
    </Router>
  );
}

export default App;
