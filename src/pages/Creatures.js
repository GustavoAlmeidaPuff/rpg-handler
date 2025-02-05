import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './creatures.css';

const Creatures = () => {
  const [creatures, setCreatures] = useState([]);
  const [filteredCreatures, setFilteredCreatures] = useState([]);
  const [displayedCreatures, setDisplayedCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [originalCreature, setOriginalCreature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    minAC: '',
    maxAC: '',
    minHP: '',
    maxHP: '',
    recommendedLevel: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    type: '',
    minAC: '',
    maxAC: '',
    minHP: '',
    maxHP: '',
    recommendedLevel: ''
  });

  useEffect(() => {
    const fetchCreatures = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://www.dnd5eapi.co/api/monsters');
        const data = await response.json();
        
        // Carregar todos os monstros de uma vez
        const allCreatures = await Promise.all(
          data.results.map(async (creature) => {
            const detailResponse = await fetch(`https://www.dnd5eapi.co${creature.url}`);
            return detailResponse.json();
          })
        );
        
        setCreatures(allCreatures);
        setFilteredCreatures(allCreatures);
        setDisplayedCreatures(allCreatures);
      } catch (error) {
        console.error('Erro ao buscar criaturas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatures();
  }, []);

  useEffect(() => {
    if (!creatures.length) return;

    const filtered = creatures.filter(creature => {
      const nameMatch = creature.name.toLowerCase().includes(appliedFilters.name.toLowerCase());
      const typeMatch = !appliedFilters.type || creature.type.toLowerCase() === appliedFilters.type.toLowerCase();
      const acMatch = (!appliedFilters.minAC || creature.armor_class[0].value >= parseInt(appliedFilters.minAC)) &&
                     (!appliedFilters.maxAC || creature.armor_class[0].value <= parseInt(appliedFilters.maxAC));
      const hpMatch = (!appliedFilters.minHP || creature.hit_points >= parseInt(appliedFilters.minHP)) &&
                     (!appliedFilters.maxHP || creature.hit_points <= parseInt(appliedFilters.maxHP));
      const recommendedLevelMatch = !appliedFilters.recommendedLevel || 
                                  Math.max(1, Math.ceil(creature.challenge_rating * 1.5)) === parseInt(appliedFilters.recommendedLevel);

      return nameMatch && typeMatch && acMatch && hpMatch && recommendedLevelMatch;
    });

    setDisplayedCreatures(filtered);
  }, [appliedFilters, creatures]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({...filters});
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      name: '',
      type: '',
      minAC: '',
      maxAC: '',
      minHP: '',
      maxHP: '',
      recommendedLevel: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDisplayedCreatures(creatures);
  };

  const getRecommendedLevel = (cr) => {
    return Math.max(1, Math.ceil(cr * 1.5));
  };

  const handleCreatureClick = async (creature) => {
    setSelectedCreature(creature);
    setOriginalCreature(creature);
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
    if (isTranslated) {
      setSelectedCreature(originalCreature);
      setIsTranslated(false);
    } else if (selectedCreature && !isTranslating) {
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

  const formatCreatureDetails = (creature) => {
    let details = [];

    details.push(`${creature.name}`);
    details.push(`${creature.size} ${creature.type}, ${creature.alignment}\n`);
    
    details.push(`Armor Class: ${creature.armor_class[0].value}`);
    details.push(`Hit Points: ${creature.hit_points} (${creature.hit_points_roll})`);
    details.push(`Speed: ${Object.entries(creature.speed).map(([key, value]) => `${key} ${value}`).join(', ')}\n`);
    
    details.push('Atributos:');
    details.push(`STR: ${creature.strength} (${Math.floor((creature.strength - 10) / 2)})`);
    details.push(`DEX: ${creature.dexterity} (${Math.floor((creature.dexterity - 10) / 2)})`);
    details.push(`CON: ${creature.constitution} (${Math.floor((creature.constitution - 10) / 2)})`);
    details.push(`INT: ${creature.intelligence} (${Math.floor((creature.intelligence - 10) / 2)})`);
    details.push(`WIS: ${creature.wisdom} (${Math.floor((creature.wisdom - 10) / 2)})`);
    details.push(`CHA: ${creature.charisma} (${Math.floor((creature.charisma - 10) / 2)})\n`);

    if (creature.proficiencies.length > 0) {
      details.push('Proficiências:');
      creature.proficiencies.forEach(prof => {
        details.push(`${prof.proficiency.name}: +${prof.value}`);
      });
      details.push('');
    }

    if (creature.special_abilities?.length > 0) {
      details.push('Habilidades Especiais:');
      creature.special_abilities.forEach(ability => {
        details.push(`${ability.name}: ${ability.desc}`);
      });
      details.push('');
    }

    if (creature.actions?.length > 0) {
      details.push('Ações:');
      creature.actions.forEach(action => {
        details.push(`${action.name}: ${action.desc}`);
      });
      details.push('');
    }

    if (creature.legendary_actions?.length > 0) {
      details.push('Ações Lendárias:');
      creature.legendary_actions.forEach(action => {
        details.push(`${action.name}: ${action.desc}`);
      });
      details.push('');
    }

    return details.join('\n');
  };

  const handleCopyClick = async () => {
    if (selectedCreature) {
      try {
        await navigator.clipboard.writeText(formatCreatureDetails(selectedCreature));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset após 2 segundos
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  const extractAttacks = (actions) => {
    if (!actions) return [];
    
    return actions
      .filter(action => {
        // Filtra ações que são ataques (contém informações de ataque/dano)
        const hasAttackRoll = action.desc.includes('attack roll') || action.desc.includes('to hit');
        const hasDamage = action.desc.includes('damage');
        return hasAttackRoll || hasDamage;
      })
      .map(action => {
        const attack = {
          name: action.name,
          toHit: null,
          damage: [],
          desc: action.desc
        };

        // Extrai o bônus de ataque
        const toHitMatch = action.desc.match(/([+-]\d+) to hit/);
        if (toHitMatch) {
          attack.toHit = toHitMatch[1];
        }

        // Extrai os danos
        const damageRegex = /(\d+\s*\([^)]+\)|(?:\d+\s*)+)\s*([\w\s]+)\s*damage/g;
        let damageMatch;
        while ((damageMatch = damageRegex.exec(action.desc)) !== null) {
          attack.damage.push({
            damage: damageMatch[1],
            type: damageMatch[2].trim()
          });
        }

        return attack;
      });
  };

  return (
    <div className="creatures-container">
      <h1 className="page-title">Criaturas</h1>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando todas as criaturas...</p>
        </div>
      ) : (
        <>
          <div className="filters-section">
            <div className="filters-inputs">
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
                  name="recommendedLevel"
                  placeholder="Nível Recomendado"
                  value={filters.recommendedLevel}
                  onChange={handleFilterChange}
                  min="1"
                />
              </div>
            </div>
            
            <div className="filters-buttons">
              <button 
                onClick={handleApplyFilters}
                className="filter-button apply"
              >
                Aplicar Filtros
              </button>
              <button 
                onClick={handleClearFilters}
                className="filter-button clear"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <div className="content-section">
            <div className="creatures-list">
              {displayedCreatures.map((creature) => (
                <div
                  key={creature.index}
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
            </div>

            {selectedCreature && (
              <div className="creature-details">
                <div className="creature-header">
                  <h2>{selectedCreature.name}</h2>
                  <div className="creature-header-buttons">
                    <button 
                      onClick={handleCopyClick}
                      className={`copy-button ${copySuccess ? 'copied' : ''}`}
                    >
                      {copySuccess ? 'Copiado!' : 'Copiar Detalhes'}
                    </button>
                    <button 
                      onClick={handleTranslateClick}
                      className={`translate-button ${isTranslated ? 'translated' : ''} ${isTranslating ? 'translating' : ''}`}
                      disabled={isTranslating}
                    >
                      {isTranslating ? 'Traduzindo...' : isTranslated ? 'Voltar ao Original' : 'Traduzir para Português'}
                    </button>
                  </div>
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

                  {selectedCreature.actions?.length > 0 && (
                    <div className="attacks">
                      <h3>Ataques</h3>
                      {extractAttacks(selectedCreature.actions).map((attack, index) => (
                        <div key={index} className="attack-item">
                          <div className="attack-header">
                            <strong>{attack.name}</strong>
                            {attack.toHit && <span className="attack-bonus">{attack.toHit} para acertar</span>}
                          </div>
                          <div className="attack-damage">
                            {attack.damage.map((dmg, i) => (
                              <span key={i} className="damage-item">
                                {dmg.damage} de dano {dmg.type}
                              </span>
                            ))}
                          </div>
                          <div className="attack-description">{attack.desc}</div>
                        </div>
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
        </>
      )}
    </div>
  );
};

export default Creatures; 