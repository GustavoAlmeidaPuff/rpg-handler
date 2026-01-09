import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './home.css';
import '../styles/global.css';
import initiativeImage from '../assets/initiative-preview.png';
import hpImage from '../assets/hp-preview.png';
import spellsImage from '../assets/spells-preview.png';
import dicesImage from '../assets/dices-preview.png';

function Home() {
  const { user } = useAuth();
  
  // Função para determinar se deve abrir em nova aba
  const shouldOpenInNewTab = () => {
    return user?.email === 'gu.almeidan2007@gmail.com';
  };

  // Componente de card que decide se usa Link ou anchor
  const CardLink = ({ to, children }) => {
    if (shouldOpenInNewTab()) {
      return (
        <a 
          href={to} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="product-card-link"
        >
          {children}
        </a>
      );
    }
    return (
      <Link to={to} className="product-card-link">
        {children}
      </Link>
    );
  };

  return (
    <div className="home-container">
      <h1 className="page-title">
        <span className='normal-text'>Bem vindo ao</span>
        <span className="gradient-text">Mago da Ponte!</span>
      </h1>
      <p className="slogan">
        O site que ajuda você, <span className="highlight-text">mestre</span>!
        <span className="slogan-subtitle">(ou jogador, quem sabe)</span>
      </p>
      
      <section className="products-section">

        <CardLink to="/initiative">
          <div className="product-card">
            <div className="card-image">
              <img src={initiativeImage} alt="Preview da página de iniciativa" />
            </div>
            <h2>Ajudante de Iniciativa</h2>
            <p>Organize sua fila de iniciativa</p>
          </div>
        </CardLink>

        <CardLink to="/hp">
          <div className="product-card">
            <div className="card-image">
              <img src={hpImage} alt="Preview do gerenciador de vida" />
            </div>
            <h2>Gerenciador de Vida</h2>
            <p>Controle os pontos de vida dos personagens</p>
          </div>
        </CardLink>

        <CardLink to="/spells">
          <div className="product-card">
            <div className="card-image">
              <img src={spellsImage} alt="Preview da lista de magias" />
            </div>
            <h2>Lista de Magias</h2>
            <p>Consulte todas as magias do D&D 5e</p>
          </div>
        </CardLink>

        <CardLink to="/dice">
          <div className="product-card">
            <div className="card-image">
              <img src={dicesImage} alt="Preview do rolador de dados" />
            </div>
            <h2>Rolador de Dados</h2>
            <p>Role dados com animações e modificadores</p>
          </div>
        </CardLink>
      </section>
    </div>
  );
}

export default Home; 