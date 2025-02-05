import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import './cadastro.css';

function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
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
        setErro('Erro ao cadastrar com Google.');
        console.error('Erro no redirecionamento:', error);
      });
  }, [navigate]);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      navigate('/');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErro('Este email já está em uso.');
          break;
        case 'auth/invalid-email':
          setErro('Email inválido.');
          break;
        case 'auth/operation-not-allowed':
          setErro('Operação não permitida.');
          break;
        case 'auth/weak-password':
          setErro('A senha é muito fraca.');
          break;
        default:
          setErro('Ocorreu um erro ao criar a conta.');
      }
    }
  };

  const handleGoogleCadastro = async () => {
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
      setErro('Erro ao cadastrar com Google.');
      console.error('Erro no cadastro:', error);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <h2>Criar Conta</h2>
        
        {erro && <p className="error-message">{erro}</p>}
        
        <form onSubmit={handleCadastro} className="cadastro-form">
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

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="cadastro-button">
            Criar Conta
          </button>
        </form>

        <div className="divider">ou</div>

        <button 
          onClick={handleGoogleCadastro}
          className="google-button"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google icon" 
            className="google-icon"
          />
          Cadastrar com Google
        </button>

        <p className="login-text">
          Já tem uma conta? <Link to="/login" className="login-link">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro; 