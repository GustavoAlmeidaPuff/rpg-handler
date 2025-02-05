import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getHPData, saveHPData, getInitiativeData } from '../services/dataService';
import './hpmanager.css';
import '../styles/global.css';

function HPManager() {
  const [characters, setCharacters] = useState([]);
  const [hpValues, setHpValues] = useState({});
  const [modifications, setModifications] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega a lista de personagens e seus HPs
        const [charactersData, hpData] = await Promise.all([
          getInitiativeData(user?.uid),
          getHPData(user?.uid)
        ]);

        setCharacters(charactersData);
        
        // Garante que todos os personagens tenham um valor de HP
        const updatedHP = { ...hpData };
        charactersData.forEach(char => {
          if (!updatedHP[char.name]) {
            updatedHP[char.name] = 0;
          }
        });
        
        setHpValues(updatedHP);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Salva os valores de HP sempre que são atualizados
  useEffect(() => {
    const saveHP = async () => {
      if (!isLoading) {
        try {
          await saveHPData(user?.uid, hpValues);
        } catch (error) {
          console.error('Erro ao salvar valores de HP:', error);
        }
      }
    };

    saveHP();
  }, [hpValues, user, isLoading]);

  const handleHPChange = (characterName, value) => {
    setHpValues(prev => ({
      ...prev,
      [characterName]: parseInt(value) || 0
    }));
  };

  const handleModification = (characterName, value) => {
    setModifications(prev => ({
      ...prev,
      [characterName]: parseInt(value) || 0
    }));
  };

  const applyModification = (characterName, isAddition = true) => {
    const currentHP = hpValues[characterName] || 0;
    const modification = modifications[characterName] || 0;
    
    setHpValues(prev => ({
      ...prev,
      [characterName]: currentHP + (isAddition ? modification : -modification)
    }));
    
    setModifications(prev => ({
      ...prev,
      [characterName]: 0
    }));
  };

  if (isLoading) {
    return (
      <div className="hp-manager-container">
        <div className="hp-message">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="hp-manager-container">
      <h1 className="page-title">
        <span className='normal-text'>Gerenciador de</span>
        <span className="gradient-text">Vida</span>
      </h1>
      
      {!user && (
        <div className="guest-message">
          ⚠️ Você está no modo offline. Seus dados estão sendo salvos apenas no cache do navegador 
          e podem ser perdidos se o cache for limpo. Para garantir que seus dados sejam salvos 
          permanentemente, faça login.
        </div>
      )}

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
                    value={hpValues[char.name] || 0}
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
                    onClick={() => applyModification(char.name, false)}
                    className="subtract-button"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => applyModification(char.name, true)}
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
