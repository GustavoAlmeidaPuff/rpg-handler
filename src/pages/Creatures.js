import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './creatures.css';

const Creatures = () => {
  const [creatures, setCreatures] = useState([]);
  const [filteredCreatures, setFilteredCreatures] = useState([]);
  const [displayedCreatures, setDisplayedCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const ITEMS_PER_PAGE = 20;
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    minAC: '',
    maxAC: '',
    minHP: '',
    maxHP: '',
    challengeRating: ''
  });

  const lastCreatureElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const fetchCreatures = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://www.dnd5eapi.co/api/monsters');
        const data = await response.json();
        
        // Carregar apenas os primeiros ITEMS_PER_PAGE monstros inicialmente
        const initialCreatures = await Promise.all(
          data.results.slice(0, ITEMS_PER_PAGE).map(async (creature) => {
            const detailResponse = await fetch(`https://www.dnd5eapi.co${creature.url}`);
            return detailResponse.json();
          })
        );
        
        setCreatures(data.results); // Guardar apenas as referências
        setFilteredCreatures(initialCreatures);
        setDisplayedCreatures(initialCreatures);
      } catch (error) {
        console.error('Erro ao buscar criaturas:', error);
      }
      setIsLoading(false);
    };

    fetchCreatures();
  }, []);

  useEffect(() => {
    const loadMoreCreatures = async () => {
      if (!isLoading && creatures.length > 0) {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = page * ITEMS_PER_PAGE;
        
        if (startIndex < creatures.length) {
          setIsLoading(true);
          const newCreatures = await Promise.all(
            creatures.slice(startIndex, endIndex).map(async (creature) => {
              const detailResponse = await fetch(`https://www.dnd5eapi.co${creature.url}`);
              return detailResponse.json();
            })
          );
          
          setFilteredCreatures(prev => [...prev, ...newCreatures]);
          setHasMore(endIndex < creatures.length);
          setIsLoading(false);
        }
      }
    };

    loadMoreCreatures();
  }, [page, creatures]);

  useEffect(() => {
    const filtered = filteredCreatures.filter(creature => {
      const nameMatch = creature.name.toLowerCase().includes(filters.name.toLowerCase());
      const typeMatch = !filters.type || creature.type.toLowerCase() === filters.type.toLowerCase();
      const acMatch = (!filters.minAC || creature.armor_class[0].value >= parseInt(filters.minAC)) &&
                     (!filters.maxAC || creature.armor_class[0].value <= parseInt(filters.maxAC));
      const hpMatch = (!filters.minHP || creature.hit_points >= parseInt(filters.minHP)) &&
                     (!filters.maxHP || creature.hit_points <= parseInt(filters.maxHP));
      const crMatch = !filters.challengeRating || creature.challenge_rating === parseFloat(filters.challengeRating);

      return nameMatch && typeMatch && acMatch && hpMatch && crMatch;
    });

    setDisplayedCreatures(filtered);
  }, [filters, filteredCreatures]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Resetar a paginação quando os filtros mudam
  };

  const getRecommendedLevel = (cr) => {
    return Math.max(1, Math.ceil(cr * 1.5));
  };

  const handleCreatureClick = async (creature) => {
    setSelectedCreature(creature);
    setIsTranslated(false);
    setIsTranslating(false);
  };

  const creatureTypes = [...new Set(filteredCreatures.map(creature => creature.type))];

  const translateText = async (text) => {
    try {
      const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=' + encodeURI(text));
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Erro na tradução:', error);
      return text;
    }
  };

  const translateCreatureDetails = async (creature) => {
    if (!creature) return null;

    try {
      const translatedDetails = {
        ...creature,
        alignment: await translateText(creature.alignment),
        size: await translateText(creature.size),
        type: await translateText(creature.type),
      };

      if (creature.special_abilities) {
        translatedDetails.special_abilities = await Promise.all(
          creature.special_abilities.map(async (ability) => ({
            ...ability,
            name: await translateText(ability.name),
            desc: await translateText(ability.desc),
          }))
        );
      }

      if (creature.actions) {
        translatedDetails.actions = await Promise.all(
          creature.actions.map(async (action) => ({
            ...action,
            name: await translateText(action.name),
            desc: await translateText(action.desc),
          }))
        );
      }

      if (creature.legendary_actions) {
        translatedDetails.legendary_actions = await Promise.all(
          creature.legendary_actions.map(async (action) => ({
            ...action,
            name: await translateText(action.name),
            desc: await translateText(action.desc),
          }))
        );
      }

      if (creature.proficiencies) {
        translatedDetails.proficiencies = await Promise.all(
          creature.proficiencies.map(async (prof) => ({
            ...prof,
            proficiency: {
              ...prof.proficiency,
              name: await translateText(prof.proficiency.name),
            },
          }))
        );
      }

      return translatedDetails;
    } catch (error) {
      console.error('Erro ao traduzir detalhes:', error);
      return creature;
    }
  };

  const handleTranslateClick = async () => {
    if (!isTranslated && selectedCreature && !isTranslating) {
      setIsTranslating(true);
      try {
        const translatedCreature = await translateCreatureDetails(selectedCreature);
        setSelectedCreature(translatedCreature);
        setIsTranslated(true);
      } catch (error) {
        console.error('Erro ao traduzir:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <div className="creatures-container">
      <div className="filters-section">
        <input
          type="text"
          name="name"
          placeholder="Nome da Criatura"
          value={filters.name}
          onChange={handleFilterChange}
        />
        
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">Todos os Tipos</option>
          {creatureTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <div className="number-filters">
          <div>
            <input
              type="number"
              name="minAC"
              placeholder="CA Min"
              value={filters.minAC}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxAC"
              placeholder="CA Max"
              value={filters.maxAC}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <input
              type="number"
              name="minHP"
              placeholder="HP Min"
              value={filters.minHP}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxHP"
              placeholder="HP Max"
              value={filters.maxHP}
              onChange={handleFilterChange}
            />
          </div>

          <input
            type="number"
            name="challengeRating"
            placeholder="Challenge Rating"
            value={filters.challengeRating}
            onChange={handleFilterChange}
            step="0.125"
          />
        </div>
      </div>

      <div className="content-section">
        <div className="creatures-list">
          {displayedCreatures.map((creature, index) => (
            <div
              key={creature.index}
              ref={index === displayedCreatures.length - 1 ? lastCreatureElementRef : null}
              className={`creature-card ${selectedCreature?.index === creature.index ? 'selected' : ''}`}
              onClick={() => handleCreatureClick(creature)}
            >
              <h3>{creature.name}</h3>
              <div className="creature-basic-info">
                <p>CA: {creature.armor_class[0].value}</p>
                <p>HP: {creature.hit_points}</p>
                <p>CR: {creature.challenge_rating}</p>
                <p>Nível Recomendado: {getRecommendedLevel(creature.challenge_rating)}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="loading-message">
              <p>Carregando criaturas...</p>
            </div>
          )}
        </div>

        {selectedCreature && (
          <div className="creature-details">
            <div className="creature-header">
              <h2>{selectedCreature.name}</h2>
              <button 
                onClick={handleTranslateClick}
                className={`translate-button ${isTranslated ? 'translated' : ''} ${isTranslating ? 'translating' : ''}`}
                disabled={isTranslated || isTranslating}
              >
                {isTranslating ? 'Traduzindo...' : isTranslated ? 'Traduzido' : 'Traduzir para Português'}
              </button>
            </div>
            <p className="creature-type">{selectedCreature.size} {selectedCreature.type}, {selectedCreature.alignment}</p>
            
            <div className="stat-block">
              <div className="basic-stats">
                <p><strong>Armor Class:</strong> {selectedCreature.armor_class[0].value}</p>
                <p><strong>Hit Points:</strong> {selectedCreature.hit_points} ({selectedCreature.hit_points_roll})</p>
                <p><strong>Speed:</strong> {Object.entries(selectedCreature.speed).map(([key, value]) => `${key} ${value}`).join(', ')}</p>
              </div>

              <div className="ability-scores">
                <div><strong>STR</strong> {selectedCreature.strength} ({Math.floor((selectedCreature.strength - 10) / 2)})</div>
                <div><strong>DEX</strong> {selectedCreature.dexterity} ({Math.floor((selectedCreature.dexterity - 10) / 2)})</div>
                <div><strong>CON</strong> {selectedCreature.constitution} ({Math.floor((selectedCreature.constitution - 10) / 2)})</div>
                <div><strong>INT</strong> {selectedCreature.intelligence} ({Math.floor((selectedCreature.intelligence - 10) / 2)})</div>
                <div><strong>WIS</strong> {selectedCreature.wisdom} ({Math.floor((selectedCreature.wisdom - 10) / 2)})</div>
                <div><strong>CHA</strong> {selectedCreature.charisma} ({Math.floor((selectedCreature.charisma - 10) / 2)})</div>
              </div>

              {selectedCreature.proficiencies.length > 0 && (
                <div className="proficiencies">
                  <h3>Proficiências</h3>
                  {selectedCreature.proficiencies.map((prof, index) => (
                    <p key={index}>{prof.proficiency.name}: +{prof.value}</p>
                  ))}
                </div>
              )}

              {selectedCreature.special_abilities?.length > 0 && (
                <div className="special-abilities">
                  <h3>Habilidades Especiais</h3>
                  {selectedCreature.special_abilities.map((ability, index) => (
                    <div key={index} className="ability">
                      <strong>{ability.name}:</strong> {ability.desc}
                    </div>
                  ))}
                </div>
              )}

              {selectedCreature.actions?.length > 0 && (
                <div className="actions">
                  <h3>Ações</h3>
                  {selectedCreature.actions.map((action, index) => (
                    <div key={index} className="action">
                      <strong>{action.name}:</strong> {action.desc}
                    </div>
                  ))}
                </div>
              )}

              {selectedCreature.legendary_actions?.length > 0 && (
                <div className="legendary-actions">
                  <h3>Ações Lendárias</h3>
                  {selectedCreature.legendary_actions.map((action, index) => (
                    <div key={index} className="legendary-action">
                      <strong>{action.name}:</strong> {action.desc}
                    </div>
                  ))}
                </div>
              )}

              {selectedCreature.spells?.length > 0 && (
                <div className="spells">
                  <h3>Magias</h3>
                  {selectedCreature.spells.map((spell, index) => (
                    <Link key={index} to={`/spells/${spell.index}`} className="spell-link">
                      {spell.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creatures; 