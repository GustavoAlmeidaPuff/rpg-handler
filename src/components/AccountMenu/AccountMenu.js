import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import accountIcon from '../../assets/account.png';
import './AccountMenu.css';

function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
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
        className="account-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={accountIcon} 
          alt="Ícone da conta" 
          className="account-icon"
        />
      </button>

      {isOpen && (
        <div className="account-dropdown">
          <div className="account-info">
            <div className="user-email">{user?.email}</div>
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