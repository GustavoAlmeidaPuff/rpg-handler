import React, { useState, useEffect } from 'react';

function Initiative() {
  const [characters, setCharacters] = useState(() => {
    // Carrega os dados do localStorage quando o componente é montado
    const savedCharacters = localStorage.getItem('rpgInitiativeCharacters');
    return savedCharacters ? JSON.parse(savedCharacters) : [];
  });
  const [newCharacter, setNewCharacter] = useState({ name: '', initiative: '' });

  // Atualiza o localStorage sempre que characters mudar
  useEffect(() => {
    localStorage.setItem('rpgInitiativeCharacters', JSON.stringify(characters));
  }, [characters]);

  const handleAddCharacter = (e) => {
    e.preventDefault();
    if (newCharacter.name && newCharacter.initiative) {
      setCharacters([
        ...characters,
        { ...newCharacter, initiative: parseInt(newCharacter.initiative) }
      ].sort((a, b) => b.initiative - a.initiative));
      setNewCharacter({ name: '', initiative: '' });
    }
  };

  const handleRemoveCharacter = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setCharacters([]);
  };

  return (
    <div className="initiative-main-content">
      <div className="initiative-container">
        <h1>Ordem de Iniciativa</h1>
        
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
          <button type="submit">Adicionar</button>
          {characters.length > 0 && (
            <button type="button" onClick={handleClearAll} className="clear-button">
              Limpar Tudo
            </button>
          )}
        </form>

        <div className="initiative-list">
          {characters.map((char, index) => (
            <div key={index} className="character-item">
              <span className="initiative-number">{char.initiative}</span>
              <span className="character-name">{char.name}</span>
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