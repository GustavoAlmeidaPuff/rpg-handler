import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Initiative from './pages/Initiative';
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import Hp from './pages/HPmanager.js';
import Spells from './pages/Spells';
import SpellDetail from './pages/SpellDetail';
import Creatures from './pages/Creatures.js';
import NPCGenerator from './pages/NPCGenerator';
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
            <Route path="/hp" element={<Hp />} />
            <Route path="/spells" element={<Spells />} />
            <Route path="/spells/:index" element={<SpellDetail />} />
            <Route path="/creatures" element={<Creatures />} />
            <Route path="/npc-generator" element={<NPCGenerator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
