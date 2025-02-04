import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Initiative from './pages/Initiative';
import Header from './components/Header/Header.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/initiative" element={<Initiative />} />
            <Route path="/dices" element={<div>Dices Page</div>} />
            <Route path="/all" element={<div>All Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
