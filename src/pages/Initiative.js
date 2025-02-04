import React, { useState } from 'react';

function Initiative() {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ name: '', initiative: '' });

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
        </form>

        <div className="initiative-list">
          {characters.map((char, index) => (
            <div key={index} className="character-item">
              <span className="initiative-number">{char.initiative}</span>
              <span className="character-name">{char.name}</span>
              <button 
                onClick={() => setCharacters(characters.filter((_, i) => i !== index))}
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