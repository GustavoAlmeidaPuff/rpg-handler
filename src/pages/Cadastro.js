import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './cadastro.css';

function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      console.error('Erro no cadastro com email:', error);
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

        <p className="login-text">
          Já tem uma conta? <Link to="/login" className="login-link">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro; 