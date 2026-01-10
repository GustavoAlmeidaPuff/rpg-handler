import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      console.error('Erro no login com email:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setErro('Email inválido.');
          break;
        case 'auth/user-disabled':
          setErro('Usuário desativado.');
          break;
        case 'auth/user-not-found':
          setErro('Usuário não encontrado.');
          break;
        case 'auth/wrong-password':
          setErro('Senha incorreta.');
          break;
        default:
          setErro('Ocorreu um erro ao fazer login.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErro('Digite seu email para recuperar a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagemSucesso('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setErro('');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setErro('Email inválido.');
          break;
        case 'auth/user-not-found':
          setErro('Usuário não encontrado.');
          break;
        default:
          setErro('Erro ao enviar email de recuperação.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErro('');
    setMensagemSucesso('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erro no login com Google:', error);
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setErro('Login cancelado pelo usuário.');
          break;
        case 'auth/popup-blocked':
          setErro('Popup bloqueado. Permita popups para este site.');
          break;
        case 'auth/cancelled-popup-request':
          // Múltiplas requisições simultâneas, pode ignorar
          break;
        default:
          setErro('Ocorreu um erro ao fazer login com Google.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar</h2>
        
        {erro && <p className="error-message">{erro}</p>}
        {mensagemSucesso && <p className="success-message">{mensagemSucesso}</p>}
        
        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-login-button"
          type="button"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>

        <div className="auth-links">
          <button 
            onClick={handleResetPassword}
            className="reset-password-button"
          >
            Esqueci minha senha
          </button>
          <p className="signup-text">
            Não tem uma conta? <Link to="/cadastro" className="signup-link">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 