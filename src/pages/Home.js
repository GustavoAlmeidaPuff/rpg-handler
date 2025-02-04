import React from 'react';
import './home.css';
import initiativeImage from '../assets/initiative-preview.png';

function Home() {
  return (
    <div className="home-container">
      <h1 className="main-title">Bem vindo ao <span className="gradient-text">Mago da Ponte</span></h1>
      
      <section className="products-section">
        <div className="product-card">
          <div className="card-image">
            <img src={initiativeImage} alt="Preview da página de iniciativa" />
          </div>
          <h2>Ajudante de Iniciativa</h2>
          <p>Organize sua fila de iniciativa</p>
        </div>
      </section>
    </div>
  );
}

export default Home; 