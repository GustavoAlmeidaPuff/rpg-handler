import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há resultado de redirecionamento do Google
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          navigate('/');
        }
      })
      .catch((error) => {
        setErro('Erro ao fazer login com Google.');
        console.error('Erro no redirecionamento:', error);
      });
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/');
    } catch (error) {
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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Verifica se é um dispositivo móvel
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Usa redirecionamento em dispositivos móveis
        await signInWithRedirect(auth, provider);
      } else {
        // Usa popup em desktops
        await signInWithPopup(auth, provider);
        navigate('/');
      }
    } catch (error) {
      setErro('Erro ao fazer login com Google.');
      console.error('Erro no login:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar</h2>
        
        {erro && <p className="error-message">{erro}</p>}
        
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
            Entrar com Email
          </button>
        </form>

        <div className="divider">ou</div>

        <button 
          onClick={handleGoogleLogin}
          className="google-button"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google icon" 
            className="google-icon"
          />
          Entrar com Google
        </button>

        <p className="signup-text">
          Não tem uma conta? <Link to="/cadastro" className="signup-link">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 