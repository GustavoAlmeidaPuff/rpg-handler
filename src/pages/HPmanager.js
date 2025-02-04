import React, { useState, useEffect } from 'react';
import './hpmanager.css';

function HPManager() {
  const [characters, setCharacters] = useState([]);
  const [hpValues, setHpValues] = useState(() => {
    // Carrega os valores de HP do localStorage quando o componente é montado
    const savedHP = localStorage.getItem('rpgCharactersHP');
    return savedHP ? JSON.parse(savedHP) : {};
  });
  const [modifications, setModifications] = useState({});

  useEffect(() => {
    // Carrega a lista de personagens do localStorage
    const savedCharacters = localStorage.getItem('rpgInitiativeCharacters');
    if (savedCharacters) {
      const parsedCharacters = JSON.parse(savedCharacters);
      setCharacters(parsedCharacters);

      // Garante que todos os personagens tenham um valor de HP
      const updatedHP = { ...hpValues };
      parsedCharacters.forEach(char => {
        if (!updatedHP[char.name]) {
          updatedHP[char.name] = 1;
        }
      });
      
      setHpValues(updatedHP);
    }
  }, []);

  // Salva os valores de HP no localStorage sempre que são atualizados
  useEffect(() => {
    localStorage.setItem('rpgCharactersHP', JSON.stringify(hpValues));
  }, [hpValues]);

  const handleHPChange = (characterName, value) => {
    setHpValues(prev => ({
      ...prev,
      [characterName]: parseInt(value) || 1
    }));
  };

  const handleModification = (characterName, value) => {
    setModifications(prev => ({
      ...prev,
      [characterName]: value
    }));
  };

  const applyModification = (characterName, operation) => {
    const currentHP = hpValues[characterName] || 0;
    const modValue = parseInt(modifications[characterName]) || 0;

    const newHP = operation === 'add' 
      ? currentHP + modValue 
      : currentHP - modValue;

    setHpValues(prev => ({
      ...prev,
      [characterName]: newHP
    }));

    // Limpa o campo de modificação após aplicar
    setModifications(prev => ({
      ...prev,
      [characterName]: ''
    }));
  };

  return (
    <div className="hp-manager-container">
      <h1>Gerenciador de <span className="gradient-text">Vida</span></h1>
      
      {characters.length === 0 ? (
        <div className="no-characters-message">
          🎲 Primeiro, adicione personagens na fila de iniciativa 🎮
        </div>
      ) : (
        <div className="character-list">
          {characters.map((char, index) => (
            <div 
              key={index} 
              className={`character-hp-item ${(hpValues[char.name] || 0) < 1 ? 'negative-hp' : ''}`}
            >
              <div className="character-info">
                <span className="initiative-number">{char.initiative}</span>
                <span className="character-name">{char.name}</span>
              </div>
              
              <div className="hp-controls">
                <div className="hp-main">
                  <label>Vida Total:</label>
                  <input
                    type="number"
                    value={hpValues[char.name] || 1}
                    onChange={(e) => handleHPChange(char.name, e.target.value)}
                    className="hp-input"
                  />
                </div>
                
                <div className="hp-modification">
                  <input
                    type="number"
                    value={modifications[char.name] || ''}
                    onChange={(e) => handleModification(char.name, e.target.value)}
                    placeholder="Quantidade"
                    className="modification-input"
                  />
                  <button 
                    onClick={() => applyModification(char.name, 'subtract')}
                    className="subtract-button"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => applyModification(char.name, 'add')}
                    className="add-button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HPManager;
