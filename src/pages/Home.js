import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import initiativeImage from '../assets/initiative-preview.png';
import hpImage from '../assets/hp-preview.png';
import spellsImage from '../assets/spells-preview.png';
import creaturesImage from '../assets/creatures-preview.png';
import npcGeneratorImage from '../assets/npc-generator-preview.png';

function Home() {
  return (
    <div className="home-container">
      <h1 className="main-title">Bem vindo ao <span className="gradient-text">Mago da Ponte</span></h1>
      <p className="slogan">
        O site que ajuda você, <span className="highlight-text">mestre</span>!
        <span className="slogan-subtitle">(ou jogador, quem sabe)</span>
      </p>
      
      <section className="products-section">
        <Link to="/initiative" className="product-card-link">
          <div className="product-card">
            <div className="card-image">
              <img src={initiativeImage} alt="Preview da página de iniciativa" />
            </div>
            <h2>Ajudante de Iniciativa</h2>
            <p>Organize sua fila de iniciativa</p>
          </div>
        </Link>

        <Link to="/hp" className="product-card-link">
          <div className="product-card">
            <div className="card-image">
              <img src={hpImage} alt="Preview do gerenciador de vida" />
            </div>
            <h2>Gerenciador de Vida</h2>
            <p>Controle os pontos de vida dos personagens</p>
          </div>
        </Link>

        <Link to="/spells" className="product-card-link">
          <div className="product-card">
            <div className="card-image">
              <img src={spellsImage} alt="Preview da lista de magias" />
            </div>
            <h2>Lista de Magias</h2>
            <p>Consulte todas as magias do D&D 5e</p>
          </div>
        </Link>

        <Link to="/creatures" className="product-card-link">
          <div className="product-card">
            <div className="card-image">
              <img src={creaturesImage} alt="Preview da lista de criaturas" />
            </div>
            <h2>Lista de Criaturas</h2>
            <p>Consulte todas as criaturas do D&D 5e</p>
          </div>
        </Link>

        <Link to="/npc-generator" className="product-card-link">
          <div className="product-card">
            <div className="card-image">
              <img src={npcGeneratorImage} alt="Preview do gerador de NPCs" />
            </div>
            <h2>Gerador de NPCs</h2>
            <p>Crie NPCs únicos com IA para sua campanha</p>
          </div>
        </Link>
      </section>
    </div>
  );
}

export default Home; 