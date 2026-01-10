import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInitiativeData, saveInitiativeData } from '../services/dataService';
import './initiative.css';
import { useNumberScroll } from '../hooks/useNumberScroll';
import { disablePageScroll, enablePageScroll } from '../utils/scrollUtils';

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
  const [editingInitiatives, setEditingInitiatives] = useState({});
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

  // Atualiza o valor temporário durante a edição (sem ordenar)
  const handleInitiativeChange = (index, newValue) => {
    setEditingInitiatives(prev => ({
      ...prev,
      [index]: newValue === '' ? '' : newValue
    }));
  };

  // Aplica a mudança e ordena (chamado no blur e Enter)
  const applyInitiativeChange = (index) => {
    const newValue = editingInitiatives[index];
    if (newValue === undefined) return; // Não houve mudança

    const updatedCharacters = [...characters];
    const parsedValue = newValue === '' ? 0 : parseInt(newValue);
    updatedCharacters[index].initiative = isNaN(parsedValue) ? 0 : parsedValue;
    setCharacters(updatedCharacters.sort((a, b) => b.initiative - a.initiative));
    
    // Limpa o valor de edição temporário
    setEditingInitiatives(prev => {
      const newEditing = { ...prev };
      delete newEditing[index];
      return newEditing;
    });
  };

  // Handler para aplicar mudança no blur
  const handleInitiativeBlur = (index) => {
    applyInitiativeChange(index);
  };

  // Handler para aplicar mudança no Enter
  const handleInitiativeKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInitiativeChange(index);
      e.target.blur(); // Remove o foco do input
    }
  };

  // Função helper para criar handlers de scroll para iniciativa dos personagens
  const createInitiativeScrollHandlers = (index) => {
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = characters[index].initiative || 0;
      const delta = e.deltaY > 0 ? -1 : 1;
      const newValue = current + delta;
      // No scroll, aplica imediatamente e ordena
      const updatedCharacters = [...characters];
      updatedCharacters[index].initiative = newValue;
      setCharacters(updatedCharacters.sort((a, b) => b.initiative - a.initiative));
      // Limpa valor de edição temporário se existir
      setEditingInitiatives(prev => {
        const newEditing = { ...prev };
        delete newEditing[index];
        return newEditing;
      });
    };

    const handleMouseEnter = () => {
      disablePageScroll();
    };

    const handleMouseLeave = () => {
      enablePageScroll();
    };

    return {
      onWheel: handleWheel,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    };
  };

  const handleConditionChange = (index, condition) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index].condition = condition;
    setCharacters(updatedCharacters);
  };

  // Handlers para scroll do mouse no input de iniciativa do formulário
  const formInitiativeScrollHandlers = useNumberScroll(
    (newValue) => setNewCharacter(prev => ({ ...prev, initiative: newValue.toString() })),
    newCharacter.initiative ? parseInt(newCharacter.initiative) : 0
  );

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
        <h1 className='page-title'>
          <span className='normal-text'>Ordem de</span>
          <span className="gradient-text">Iniciativa</span>
        </h1>
      <div className="initiative-container">
        
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
            {...formInitiativeScrollHandlers}
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
                value={editingInitiatives[index] !== undefined 
                  ? editingInitiatives[index] 
                  : (char.initiative === 0 ? '' : char.initiative)}
                onChange={(e) => handleInitiativeChange(index, e.target.value)}
                onBlur={() => handleInitiativeBlur(index)}
                onKeyDown={(e) => handleInitiativeKeyDown(index, e)}
                {...createInitiativeScrollHandlers(index)}
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