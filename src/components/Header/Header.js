import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../logo.png';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <nav className="nav-menu">
          <Link to="/initiative" className="nav-link">Initiative</Link>
          <Link to="/dices" className="nav-link">Dices</Link>
          <Link to="/all" className="nav-link">All</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header; 