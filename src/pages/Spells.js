import React, { useState, useEffect, useRef, useCallback } from 'react';
import './spells.css';
import { Link } from 'react-router-dom';

function Spells() {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSpellsData, setAllSpellsData] = useState([]);
  const [tempNameFilter, setTempNameFilter] = useState('');
  const [tempLevelFilter, setTempLevelFilter] = useState('all');
  const SPELLS_PER_PAGE = 20;

  // Referência para o elemento observador
  const observer = useRef();
  const lastSpellElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Buscar lista inicial de magias
  useEffect(() => {
    const fetchInitialSpells = async () => {
      try {
        const response = await fetch('https://www.dnd5eapi.co/api/spells');
        const data = await response.json();
        setAllSpellsData(data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spells:', error);
        setLoading(false);
      }
    };

    fetchInitialSpells();
  }, []);

  // Carregar detalhes das magias conforme necessário
  useEffect(() => {
    const loadSpellDetails = async () => {
      if (!allSpellsData.length) return;

      setLoading(true);
      
      // Filtrar allSpellsData antes de carregar os detalhes
      let filteredData = allSpellsData;
      if (nameFilter) {
        filteredData = filteredData.filter(spell => 
          spell.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }

      const startIndex = page * SPELLS_PER_PAGE;
      const endIndex = startIndex + SPELLS_PER_PAGE;
      const currentPageSpells = filteredData.slice(startIndex, endIndex);

      if (currentPageSpells.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      try {
        const newSpellsDetails = await Promise.all(
          currentPageSpells.map(spell =>
            fetch(`https://www.dnd5eapi.co${spell.url}`).then(res => res.json())
          )
        );

        // Filtrar por nível após ter os detalhes
        const levelFilteredSpells = levelFilter === 'all' 
          ? newSpellsDetails 
          : newSpellsDetails.filter(spell => spell.level === parseInt(levelFilter));

        if (page === 0) {
          setSpells(levelFilteredSpells);
        } else {
          setSpells(prevSpells => [...prevSpells, ...levelFilteredSpells]);
        }
        
        setHasMore(currentPageSpells.length === SPELLS_PER_PAGE);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spell details:', error);
        setLoading(false);
      }
    };

    loadSpellDetails();
  }, [page, allSpellsData, nameFilter, levelFilter]);

  const handleFilter = () => {
    setNameFilter(tempNameFilter);
    setLevelFilter(tempLevelFilter);
    setSpells([]);
    setPage(0);
    setHasMore(true);
  };

  return (
    <div className="spells-container">
      <h1>Lista de <span className="gradient-text">Magias D&D 5e</span></h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={tempNameFilter}
          onChange={(e) => setTempNameFilter(e.target.value)}
          className="name-filter"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleFilter();
          }}
        />
        <select
          value={tempLevelFilter}
          onChange={(e) => setTempLevelFilter(e.target.value)}
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
        <button onClick={handleFilter} className="filter-button">
          Filtrar
        </button>
      </div>

      <div className="spells-list">
        {spells.length === 0 && !loading ? (
          <div className="no-spells-message">
            Nenhuma magia encontrada com os filtros atuais.
          </div>
        ) : (
          spells.map((spell, index) => (
            <div 
              key={spell.index} 
              ref={index === spells.length - 1 ? lastSpellElementRef : null}
              className="spell-card"
            >
              <div className="spell-header">
                <h3>{spell.name}</h3>
                <span className="spell-level">Nível {spell.level}</span>
                <Link 
                  to={`/spells/${spell.index}`}
                  className="spell-details-link"
                >
                  Ver detalhes
                </Link>
              </div>
              <p className="spell-school">{spell.school.name}</p>
            </div>
          ))
        )}
        {loading && (
          <div className="loading-more">
            Carregando mais magias...
          </div>
        )}
      </div>
    </div>
  );
}

export default Spells;
