import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
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