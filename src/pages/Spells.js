import React, { useState, useEffect } from 'react';
import './spells.css';

function Spells() {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const fetchSpellDetails = async () => {
      try {
        const response = await fetch('https://www.dnd5eapi.co/api/spells');
        const data = await response.json();
        
        // Buscar detalhes de cada magia
        const detailsPromises = data.results.map(spell =>
          fetch(`https://www.dnd5eapi.co${spell.url}`)
            .then(res => res.json())
        );
        
        const spellsWithDetails = await Promise.all(detailsPromises);
        setSpells(spellsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spells:', error);
        setLoading(false);
      }
    };

    fetchSpellDetails();
  }, []);

  const filteredSpells = spells.filter(spell => {
    const nameMatch = spell.name.toLowerCase().includes(nameFilter.toLowerCase());
    const levelMatch = levelFilter === 'all' || spell.level === parseInt(levelFilter);
    return nameMatch && levelMatch;
  });

  if (loading) {
    return (
      <div className="spells-container">
        <div className="loading">Carregando magias...</div>
      </div>
    );
  }

  return (
    <div className="spells-container">
      <h1>Lista de <span className="gradient-text">Magias D&D 5e</span></h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="name-filter"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="level-filter"
        >
          <option value="all">Todos os níveis</option>
          <option value="0">Nível 0 (Truques)</option>
          <option value="1">Nível 1</option>
          <option value="2">Nível 2</option>
          <option value="3">Nível 3</option>
          <option value="4">Nível 4</option>
          <option value="5">Nível 5</option>
          <option value="6">Nível 6</option>
          <option value="7">Nível 7</option>
          <option value="8">Nível 8</option>
          <option value="9">Nível 9</option>
        </select>
      </div>

      <div className="spells-list">
        {filteredSpells.length === 0 ? (
          <div className="no-spells-message">
            Nenhuma magia encontrada com os filtros atuais.
          </div>
        ) : (
          filteredSpells.map((spell) => (
            <div key={spell.index} className="spell-card">
              <div className="spell-header">
                <h3>{spell.name}</h3>
                <span className="spell-level">Nível {spell.level}</span>
                <a 
                  href={`https://www.dnd5eapi.co${spell.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="spell-details-link"
                >
                  Ver detalhes
                </a>
              </div>
              <p className="spell-school">{spell.school.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Spells;
