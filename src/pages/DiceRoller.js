import React, { useState } from 'react';
import './diceroller.css';
import '../styles/global.css';

function DiceRoller() {
  const [results, setResults] = useState({ values: [], total: 0, sides: null });
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [lastRolledDice, setLastRolledDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [criticals, setCriticals] = useState({ success: false, fail: false });

  const diceTypes = [
    { value: 4, symbol: 'd4' },
    { value: 6, symbol: 'd6' },
    { value: 8, symbol: 'd8' },
    { value: 10, symbol: 'd10' },
    { value: 12, symbol: 'd12' },
    { value: 20, symbol: 'd20' },
    { value: 100, symbol: 'd100' }
  ];

  const rollDice = (sides) => {
    setIsRolling(true);
    setLastRolledDice(sides);
    setCriticals({ success: false, fail: false });
    
    const newResults = [];
    let total = 0;
    let hasCriticalSuccess = false;
    let hasCriticalFail = false;
    
    for (let i = 0; i < diceCount; i++) {
      const result = Math.floor(Math.random() * sides) + 1;
      total += result;
      newResults.push(result);

      // Verifica críticos no d20
      if (sides === 20) {
        if (result === 20) {
          hasCriticalSuccess = true;
        }
        if (result === 1) {
          hasCriticalFail = true;
        }
      }
    }

    // Adiciona o modificador ao total
    total += parseInt(modifier) || 0;

    setTimeout(() => {
      setResults({ 
        values: newResults, 
        total, 
        sides,
        modifier: parseInt(modifier) || 0 
      });
      setIsRolling(false);
      setCriticals({
        success: hasCriticalSuccess,
        fail: hasCriticalFail
      });
    }, 800);
  };

  const handleDiceCountChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setDiceCount(Math.max(1, Math.min(20, value)));
  };

  const handleModifierChange = (e) => {
    const value = e.target.value;
    setModifier(value === '' ? 0 : parseInt(value));
  };

  return (
    <div className="dice-roller-container">
      <h1>
        <span className="gradient-text">Rolagem</span>
        <span className="normal-text">de Dados</span>
      </h1>

      <div className="dice-controls">
        <div className="controls-row">
          <div className="dice-count-control">
            <label htmlFor="diceCount">Quantidade de Dados:</label>
            <input
              type="number"
              id="diceCount"
              min="1"
              max="20"
              value={diceCount}
              onChange={handleDiceCountChange}
            />
          </div>

          <div className="modifier-control">
            <label htmlFor="modifier">Modificador:</label>
            <input
              type="number"
              id="modifier"
              value={modifier}
              onChange={handleModifierChange}
              placeholder="+0"
            />
          </div>
        </div>

        <div className="dice-buttons">
          {diceTypes.map(({ value, symbol }) => (
            <button
              key={value}
              className={`dice-button d${value} ${lastRolledDice === value ? 'last-rolled' : ''}`}
              onClick={() => rollDice(value)}
              disabled={isRolling}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {isRolling && (
        <div className="rolling-animation">
          <div className="dice-container">
            <div className="dice"></div>
          </div>
          <p>Rolando os dados...</p>
        </div>
      )}

      {results.sides && !isRolling && (
        <div className={`results-container ${criticals.success ? 'has-critical-success' : ''} ${criticals.fail ? 'has-critical-fail' : ''}`}>
          <h2>Resultados (d{results.sides}):</h2>
          <div className="individual-results">
            {results.values.map((value, index) => (
              <span 
                key={index} 
                className={`result-value ${
                  results.sides === 20 && value === 20 ? 'critical-success' :
                  results.sides === 20 && value === 1 ? 'critical-fail' : ''
                }`}
              >
                {value}
              </span>
            ))}
          </div>
          {(results.values.length > 1 || results.modifier !== 0) && (
            <div className="total-result">
              <span>
                Total: {results.total}
                {results.modifier !== 0 && (
                  <span className="modifier-text">
                    {' '}({results.total - results.modifier} {results.modifier > 0 ? '+' : ''}{results.modifier})
                  </span>
                )}
              </span>
            </div>
          )}
          {(criticals.success || criticals.fail) && (
            <div className="critical-messages">
              {criticals.success && (
                <div className="critical-message success">
                  🎯 Acerto Crítico!
                </div>
              )}
              {criticals.fail && (
                <div className="critical-message fail">
                  💥 Falha Crítica!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiceRoller; 