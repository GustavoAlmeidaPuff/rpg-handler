import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountMenu from '../AccountMenu/AccountMenu';
import logo from '../../logo.png';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        {/* Menu Desktop */}
        <nav className="nav-menu desktop">
          <Link to="/initiative" className="nav-link">Iniciativa</Link>
          <Link to="/hp" className="nav-link">HP</Link>
          <Link to="/spells" className="nav-link">Magias</Link>
          <Link to="/creatures" className="nav-link">Criaturas</Link>
          <Link to="/npc-generator" className="nav-link">Gerador de NPCs</Link>
          {user ? (
            <AccountMenu />
          ) : (
            <Link to="/login" className="login-button">Entrar</Link>
          )}
        </nav>

        {/* Container para Hamburguer e Conta em Mobile */}
        <div className="mobile-controls">
          {user ? (
            <AccountMenu />
          ) : (
            <Link to="/login" className="login-button mobile">Entrar</Link>
          )}
          
          {/* Botão Hamburguer */}
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Menu Mobile */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <nav className="nav-menu mobile">
            <Link to="/" className="nav-link" onClick={closeMenu}>Início</Link>
            <Link to="/initiative" className="nav-link" onClick={closeMenu}>Iniciativa</Link>
            <Link to="/hp" className="nav-link" onClick={closeMenu}>HP</Link>
            <Link to="/spells" className="nav-link" onClick={closeMenu}>Magias</Link>
            <Link to="/creatures" className="nav-link" onClick={closeMenu}>Criaturas</Link>
            <Link to="/npc-generator" className="nav-link" onClick={closeMenu}>Gerador de NPCs</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 