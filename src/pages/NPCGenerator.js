import React, { useState } from 'react';
import { HfInference } from '@huggingface/inference';
import './npcgenerator.css';

function NPCGenerator() {
  const [theme, setTheme] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [npc, setNpc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const themes = [
    'Fantasia Medieval',
    'Cyberpunk',
    'Moderno (Anos 80)',
    'Moderno (Anos 70)',
    'Guerra Mundial',
    'Pós-Apocalíptico',
    'Steampunk',
    'Faroeste',
    'Horror Gótico',
    'Piratas',
    'Espacial/Sci-Fi'
  ];

  const generatePrompt = (theme, description) => {
    return `Gere um NPC detalhado para um cenário de RPG com tema ${theme}${description ? ` no seguinte contexto: ${description}` : ''}.

O NPC deve ter as seguintes informações:
1. Nome completo e/ou apelido apropriado para o cenário
2. Aparência física detalhada
3. Personalidade e comportamento
4. História de fundo/Background
5. Características principais e habilidades
6. Sugestão de atributos (força, destreza, etc) baseado na descrição
7. Peculiaridades ou maneirismos únicos

Responda no seguinte formato JSON:
{
  "name": "Nome do NPC",
  "appearance": "Descrição da aparência",
  "personality": "Descrição da personalidade",
  "background": "História do personagem",
  "characteristics": "Características e habilidades",
  "statGuide": "Sugestão de atributos",
  "quirks": "Peculiaridades"
}`;
  };

  const handleGenerateNPC = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hf = new HfInference(process.env.REACT_APP_HUGGINGFACE_TOKEN);
      const prompt = generatePrompt(theme, scenarioDescription);

      const response = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      });

      try {
        // Encontra o primeiro objeto JSON válido na resposta
        const jsonStr = response.generated_text.match(/\{[\s\S]*\}/)[0];
        const generatedNPC = JSON.parse(jsonStr);
        setNpc(generatedNPC);
      } catch (parseError) {
        console.error('Erro ao processar resposta:', parseError);
        setError('Erro ao processar a resposta da IA. Tente novamente.');
      }
    } catch (apiError) {
      console.error('Erro na API:', apiError);
      setError('Erro ao conectar com a IA. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="npc-generator-container">
      <h1>Gerador de <span className="gradient-text">NPCs</span></h1>
      
      <div className="generator-form">
        <div className="form-group">
          <label>Temática do Cenário</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            required
          >
            <option value="">Selecione uma temática</option>
            {themes.map((theme, index) => (
              <option key={index} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Descrição do Cenário (Opcional)</label>
          <textarea
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
            placeholder="Descreva o cenário onde o NPC está inserido..."
            rows={4}
          />
        </div>

        <button 
          onClick={handleGenerateNPC} 
          disabled={!theme || isLoading}
          className="generate-button"
        >
          {isLoading ? 'Gerando NPC...' : 'Gerar NPC'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {npc && (
        <div className="npc-card">
          <h2>{npc.name}</h2>
          
          <div className="npc-section">
            <h3>Aparência</h3>
            <p>{npc.appearance}</p>
          </div>

          <div className="npc-section">
            <h3>Personalidade</h3>
            <p>{npc.personality}</p>
          </div>

          <div className="npc-section">
            <h3>História</h3>
            <p>{npc.background}</p>
          </div>

          <div className="npc-section">
            <h3>Características</h3>
            <p>{npc.characteristics}</p>
          </div>

          <div className="npc-section">
            <h3>Guia de Atributos</h3>
            <p>{npc.statGuide}</p>
          </div>

          <div className="npc-section">
            <h3>Peculiaridades</h3>
            <p>{npc.quirks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NPCGenerator; 