import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import accountIcon from '../../assets/account.png';
import './AccountMenu.css';

function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isCreator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="account-menu">
      <button 
        className={`account-button ${isCreator ? 'creator-button' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={accountIcon} 
          alt="Ícone da conta" 
          className="account-icon"
        />
        {isCreator && <span className="creator-crown">👑</span>}
      </button>

      {isOpen && (
        <div className="account-dropdown">
          <div className="account-info">
            <div className="user-email">
              <span className="email-text">{user?.email}</span>
              {isCreator && <span className="creator-badge">Criador</span>}
            </div>
            {user?.displayName && (
              <div className="user-name">{user.displayName}</div>
            )}
          </div>
          
          <div className="account-divider" />
          
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu; 