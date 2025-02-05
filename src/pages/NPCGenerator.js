import React, { useState } from 'react';
import './npcgenerator.css';

function NPCGenerator() {
  const [theme, setTheme] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [npc, setNpc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const themes = [
    'Fantasia Medieval',
    'Cyberpunk',
    'Moderno (Anos 80)',
    'Moderno (Anos 70)',
    'Guerra Mundial',
    'Pós-Apocalíptico',
    'Steampunk',
    'Faroeste',
    'Horror Gótico',
    'Piratas',
    'Espacial/Sci-Fi'
  ];

  const handleGenerateNPC = () => {
    setIsLoading(true);
    // Aqui será implementada a chamada para a API de IA
    // Por enquanto, vamos simular uma resposta
    setTimeout(() => {
      const mockNPC = {
        name: 'Marcus "Chip" Silva',
        appearance: 'Um homem alto e magro com cabelos grisalhos precoces, usa óculos de realidade aumentada e tem várias tatuagens de circuitos nos braços.',
        personality: 'Introvertido e calculista, mas surpreendentemente carismático quando o assunto é tecnologia. Tem um senso de humor seco e sarcástico.',
        background: 'Ex-programador corporativo que agora trabalha no mercado negro de implantes neurais.',
        characteristics: 'Possui conhecimento excepcional de tecnologia e redes, mas sua constituição física é fraca devido a anos de trabalho sedentário.',
        statGuide: 'Sugestão de Atributos: Alta Inteligência e Carisma, Baixa Força e Constituição.',
        quirks: 'Sempre carrega um deck de cartas modificado com hologramas e nunca consegue manter contato visual por mais de alguns segundos.'
      };
      setNpc(mockNPC);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="npc-generator-container">
      <h1>Gerador de <span className="gradient-text">NPCs</span></h1>
      
      <div className="generator-form">
        <div className="form-group">
          <label>Temática do Cenário</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            required
          >
            <option value="">Selecione uma temática</option>
            {themes.map((theme, index) => (
              <option key={index} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Descrição do Cenário (Opcional)</label>
          <textarea
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
            placeholder="Descreva o cenário onde o NPC está inserido..."
            rows={4}
          />
        </div>

        <button 
          onClick={handleGenerateNPC} 
          disabled={!theme || isLoading}
          className="generate-button"
        >
          {isLoading ? 'Gerando NPC...' : 'Gerar NPC'}
        </button>
      </div>

      {npc && (
        <div className="npc-card">
          <h2>{npc.name}</h2>
          
          <div className="npc-section">
            <h3>Aparência</h3>
            <p>{npc.appearance}</p>
          </div>

          <div className="npc-section">
            <h3>Personalidade</h3>
            <p>{npc.personality}</p>
          </div>

          <div className="npc-section">
            <h3>História</h3>
            <p>{npc.background}</p>
          </div>

          <div className="npc-section">
            <h3>Características</h3>
            <p>{npc.characteristics}</p>
          </div>

          <div className="npc-section">
            <h3>Guia de Atributos</h3>
            <p>{npc.statGuide}</p>
          </div>

          <div className="npc-section">
            <h3>Peculiaridades</h3>
            <p>{npc.quirks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NPCGenerator; 