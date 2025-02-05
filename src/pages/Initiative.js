import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInitiativeData, saveInitiativeData } from '../services/dataService';
import './initiative.css';

const CONDITIONS = [
  'Agarrado', 'Amedrontado', 'Atordoado', 'Caído', 'Cego',
  'Confuso', 'Contido', 'Desafiado', 'Dominado', 'Enfeitiçado',
  'Envenenado', 'Exaustão', 'Incapacitado', 'Inconsciente',
  'Invisível', 'Marcado', 'Paralisado', 'Petrificado',
  'Possuído', 'Rastreado', 'Surdo'
];

function Initiative() {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ name: '', initiative: '', condition: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Carrega os dados quando o componente é montado
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getInitiativeData(user?.uid);
        setCharacters(data);
      } catch (error) {
        console.error('Erro ao carregar dados de iniciativa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Salva os dados sempre que characters mudar
  useEffect(() => {
    const saveData = async () => {
      if (!isLoading) {
        try {
          await saveInitiativeData(user?.uid, characters);
        } catch (error) {
          console.error('Erro ao salvar dados de iniciativa:', error);
        }
      }
    };

    saveData();
  }, [characters, user, isLoading]);

  const handleAddCharacter = (e) => {
    e.preventDefault();
    if (newCharacter.name && newCharacter.initiative) {
      setCharacters([
        ...characters,
        { 
          ...newCharacter, 
          initiative: parseInt(newCharacter.initiative),
          condition: newCharacter.condition || ''
        }
      ].sort((a, b) => b.initiative - a.initiative));
      setNewCharacter({ name: '', initiative: '', condition: '' });
    }
  };

  const handleRemoveCharacter = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setCharacters([]);
  };

  const handleInitiativeChange = (index, newValue) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index].initiative = parseInt(newValue) || 0;
    setCharacters(updatedCharacters.sort((a, b) => b.initiative - a.initiative));
  };

  const handleConditionChange = (index, condition) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index].condition = condition;
    setCharacters(updatedCharacters);
  };

  if (isLoading) {
    return (
      <div className="initiative-container">
        <div className="initiative-message">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="initiative-main-content">
      <div className="initiative-container">
        <h1 className='page-title'><span className='normal-text'>Ordem de</span> <span className="gradient-text">Iniciativa</span></h1>
        
        {!user && (
          <div className="guest-message">
            ⚠️ Você está no modo offline. Seus dados estão sendo salvos apenas no cache do navegador 
            e podem ser perdidos se o cache for limpo. Para garantir que seus dados sejam salvos 
            permanentemente, faça login.
          </div>
        )}
        
        <form onSubmit={handleAddCharacter} className="initiative-form">
          <input
            type="text"
            placeholder="Nome do Personagem"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Valor da Iniciativa"
            value={newCharacter.initiative}
            onChange={(e) => setNewCharacter({ ...newCharacter, initiative: e.target.value })}
          />
          <select
            className="condition-select"
            value={newCharacter.condition}
            onChange={(e) => setNewCharacter({ ...newCharacter, condition: e.target.value })}
          >
            <option value="">Sem Condição</option>
            {CONDITIONS.map(condition => (
              <option key={condition} value={condition.toLowerCase()}>
                {condition}
              </option>
            ))}
          </select>
          <button type="submit">Adicionar</button>
          {characters.length > 0 && (
            <button type="button" onClick={handleClearAll} className="clear-button">
              Limpar Tudo
            </button>
          )}
        </form>

        <div className="initiative-list">
          {characters.map((char, index) => (
            <div 
              key={index} 
              className={`character-item ${char.condition ? `condition-${char.condition}` : ''}`}
            >
              <input
                type="number"
                className="initiative-number editable"
                value={char.initiative}
                onChange={(e) => handleInitiativeChange(index, e.target.value)}
              />
              <span className="character-name">
                {char.name}
                {char.condition && (
                  <span className="condition-badge">
                    {char.condition.charAt(0).toUpperCase() + char.condition.slice(1)}
                  </span>
                )}
              </span>
              <select
                className="condition-select"
                value={char.condition}
                onChange={(e) => handleConditionChange(index, e.target.value)}
              >
                <option value="">Sem Condição</option>
                {CONDITIONS.map(condition => (
                  <option key={condition} value={condition.toLowerCase()}>
                    {condition}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => handleRemoveCharacter(index)}
                className="remove-button"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Initiative; 