import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './spellDetail.css';

function SpellDetail() {
  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(true);
  const { index } = useParams();

  useEffect(() => {
    const fetchSpellDetail = async () => {
      try {
        const response = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`);
        const data = await response.json();
        setSpell(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spell details:', error);
        setLoading(false);
      }
    };

    fetchSpellDetail();
  }, [index]);

  if (loading) {
    return <div className="loading">Carregando detalhes da magia...</div>;
  }

  if (!spell) {
    return <div>Magia não encontrada</div>;
  }

  return (
    <div className="spell-detail-container">
      <Link to="/spells" className="back-button">← Voltar para lista</Link>
      
      <div className="spell-detail-card">
        <header className="spell-detail-header">
          <h1>{spell.name}</h1>
          <div className="spell-meta">
            <span className="spell-level">Nível {spell.level}</span>
            <span className="spell-school">{spell.school.name}</span>
          </div>
        </header>

        <div className="spell-info">
          <div className="spell-casting-info">
            <p><strong>Tempo de Conjuração:</strong> {spell.casting_time}</p>
            <p><strong>Alcance:</strong> {spell.range}</p>
            <p><strong>Componentes:</strong> {spell.components.join(', ')}</p>
            <p><strong>Duração:</strong> {spell.duration}</p>
          </div>

          <div className="spell-description">
            <h2>Descrição</h2>
            <p>{spell.desc.join('\n\n')}</p>
          </div>

          {spell.higher_level && spell.higher_level.length > 0 && (
            <div className="higher-level">
              <h2>Em Níveis Superiores</h2>
              <p>{spell.higher_level.join('\n\n')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpellDetail; 