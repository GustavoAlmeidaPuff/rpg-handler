import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountMenu from '../AccountMenu/AccountMenu';
import logo from '../../logo.png';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

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
          <Link to="/initiative" className={`nav-link ${location.pathname === '/initiative' ? 'active' : ''}`}>Iniciativa</Link>
          <Link to="/hp" className={`nav-link ${location.pathname === '/hp' ? 'active' : ''}`}>HP</Link>
          <Link to="/spells" className={`nav-link ${location.pathname === '/spells' ? 'active' : ''}`}>Magias</Link>
          <Link to="/creatures" className={`nav-link ${location.pathname === '/creatures' ? 'active' : ''}`}>Criaturas</Link>
          <Link to="/npc-generator" className={`nav-link ${location.pathname === '/npc-generator' ? 'active' : ''}`}>Gerador de NPCs</Link>
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
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Início</Link>
            <Link to="/initiative" className={`nav-link ${location.pathname === '/initiative' ? 'active' : ''}`} onClick={closeMenu}>Iniciativa</Link>
            <Link to="/hp" className={`nav-link ${location.pathname === '/hp' ? 'active' : ''}`} onClick={closeMenu}>HP</Link>
            <Link to="/spells" className={`nav-link ${location.pathname === '/spells' ? 'active' : ''}`} onClick={closeMenu}>Magias</Link>
            <Link to="/creatures" className={`nav-link ${location.pathname === '/creatures' ? 'active' : ''}`} onClick={closeMenu}>Criaturas</Link>
            <Link to="/npc-generator" className={`nav-link ${location.pathname === '/npc-generator' ? 'active' : ''}`} onClick={closeMenu}>Gerador de NPCs</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 