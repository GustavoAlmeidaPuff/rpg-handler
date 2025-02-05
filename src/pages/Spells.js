import React, { useState, useEffect } from 'react';
import './spells.css';

function Spells() {
  const [spells, setSpells] = useState(() => {
    const savedSpells = localStorage.getItem('rpgSpells');
    return savedSpells ? JSON.parse(savedSpells) : [];
  });
  const [newSpell, setNewSpell] = useState({
    name: '',
    level: '',
    description: ''
  });

  useEffect(() => {
    localStorage.setItem('rpgSpells', JSON.stringify(spells));
  }, [spells]);

  const handleAddSpell = (e) => {
    e.preventDefault();
    if (newSpell.name && newSpell.level) {
      setSpells([...spells, newSpell]);
      setNewSpell({ name: '', level: '', description: '' });
    }
  };

  const handleRemoveSpell = (index) => {
    setSpells(spells.filter((_, i) => i !== index));
  };

  return (
    <div className="spells-container">
      <h1>Lista de <span className="gradient-text">Magias</span></h1>

      <form onSubmit={handleAddSpell} className="spell-form">
        <input
          type="text"
          placeholder="Nome da Magia"
          value={newSpell.name}
          onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Nível"
          value={newSpell.level}
          onChange={(e) => setNewSpell({ ...newSpell, level: e.target.value })}
          min="0"
          max="9"
        />
        <textarea
          placeholder="Descrição da Magia"
          value={newSpell.description}
          onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })}
        />
        <button type="submit">Adicionar Magia</button>
      </form>

      <div className="spells-list">
        {spells.length === 0 ? (
          <div className="no-spells-message">
            🎲 Adicione suas magias para começar! ✨
          </div>
        ) : (
          spells.map((spell, index) => (
            <div key={index} className="spell-card">
              <div className="spell-header">
                <h3>{spell.name}</h3>
                <span className="spell-level">Nível {spell.level}</span>
                <button 
                  onClick={() => handleRemoveSpell(index)}
                  className="remove-spell-button"
                >
                  ×
                </button>
              </div>
              {spell.description && (
                <p className="spell-description">{spell.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Spells;
