import React, { useState, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import aiIcon from '../assets/ia-icon.png';
import './npcgenerator.css';
import '../styles/global.css';

function NPCGenerator() {
  const [theme, setTheme] = useState('');
  const [scenarioDetails, setScenarioDetails] = useState('');
  const [characterDetails, setCharacterDetails] = useState('');
  const [npc, setNpc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const themes = [
    'Fantasia Medieval',
    'Cyberpunk',
    'Moderno (Dias Atuais)',
    'Moderno (Anos 80)',
    'Moderno (Anos 70)',
    'Guerra Mundial',
    'Pós-Apocalíptico',
    'Steampunk',
    'Faroeste',
    'Horror Gótico',
    'Horror Moderno',
    'Horror Cósmico',
    'Piratas',
    'Espacial/Sci-Fi',
    'Espionagem',
    'Super-Heróis',
    'Mitologia Nórdica',
    'Mitologia Grega',
    'Mitologia Japonesa',
    'Fantasia Urbana',
    'Academia de Magia',
    'Investigação Sobrenatural',
    'Investigação Criminal',
    'Submundo do Crime',
    'Pós-Guerra',
    'Realismo Mágico'
  ];

  const formatNPCToText = (npc) => {
    return npc.description;
  };

  const handleCopyNPC = async () => {
    if (npc) {
      try {
        const text = formatNPCToText(npc);
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset após 2 segundos
      } catch (err) {
        console.error('Erro ao copiar:', err);
        setError('Não foi possível copiar o texto. Tente novamente.');
      }
    }
  };

  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const generatePrompt = (theme, scenarioDetails, characterDetails) => {
    return `<|system|>Você é um mestre de RPG experiente. Crie uma descrição detalhada e envolvente de um NPC com a temática ${theme}. 
    
Detalhes do cenário fornecidos:
${scenarioDetails}

Detalhes específicos do personagem desejado:
${characterDetails}

Com base nesses detalhes do cenário e do personagem, crie um personagem que se encaixe perfeitamente nesse mundo e possa interagir de forma significativa com ele. Inclua detalhes sobre sua aparência, personalidade, história de vida, motivações e peculiaridades de uma forma narrativa e fluida, como se estivesse contando uma história sobre este personagem.

não comece com frases como "o nome do personagem é" ou "o personagem se chama" ou "o nome do personagem é".

a resposta DEVE começar com o nome do personagem, depois a descrição dele direto.

responde em português do brasil

<|output|>`;

  };

  const handleGenerateNPC = async () => {
    setIsLoading(true);
    setError(null);
    setNpc(null);

    try {
      const hf = new HfInference(process.env.REACT_APP_HUGGINGFACE_TOKEN);
      const prompt = generatePrompt(theme, scenarioDetails, characterDetails);

      const response = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.75,
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.1,
          return_full_text: false,
          stop: ["<"],
        },
      });

      const description = response.generated_text.trim();
      setNpc({ description });
    } catch (apiError) {
      console.error('Erro na API:', apiError);
      setError('Erro ao conectar com a IA. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNPC = async () => {
    if (!npc) return;

    try {
      const npcData = {
        ...npc,
        theme,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'npcs'), npcData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao salvar NPC:', err);
      setError('Erro ao salvar o NPC. Tente novamente.');
    }
  };

  return (
    <div className="npc-generator-container">
      <h1 className="page-title"><span className="normal-text">Gerador de </span><span className="gradient-text">NPCs</span></h1>
      
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
          <label>Detalhes do Cenário (opcional)</label>
          <textarea
            value={scenarioDetails}
            onChange={(e) => setScenarioDetails(e.target.value)}
            placeholder="Descreva os detalhes específicos do seu cenário, como: localização, época, eventos importantes, facções existentes, etc."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Detalhes do Personagem (opcional)</label>
          <textarea
            value={characterDetails}
            onChange={(e) => setCharacterDetails(e.target.value)}
            placeholder="Descreva características específicas que você deseja que o personagem tenha, como: profissão, papel na história, tipo de personalidade, etc."
            rows={4}
          />
        </div>

        <button 
          onClick={handleGenerateNPC} 
          disabled={!theme || isLoading}
          className="generate-button"
        >
          <img src={aiIcon} alt="AI" className="ai-icon" />
          {isLoading ? 'Gerando NPC...' : 'Gerar NPC'}
        </button>

        {isLoading && (
          <div className="loading-container">
            <div className="loading-animation">
              <div className="dice-container">
                <div className="dice"></div>
              </div>
            </div>
            <p className="loading-text">
              Gerando seu NPC... {loadingTime}s
            </p>
            <p className="loading-flavor-text">
              {loadingTime < 5 ? "Rolando dados..." : 
               loadingTime < 10 ? "Consultando o grimório..." : 
               loadingTime < 15 ? "Invocando personalidade..." : 
               "Finalizando os detalhes..."}
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {npc && (
        <div className="npc-card">
          <div className="npc-header">
            <div className="npc-actions">
              <button 
                onClick={handleCopyNPC}
                className={`action-button copy-button ${copySuccess ? 'copied' : ''}`}
              >
                {copySuccess ? 'Copiado!' : 'Copiar NPC'}
              </button>
              <button 
                onClick={handleSaveNPC}
                className={`action-button save-button ${saveSuccess ? 'saved' : ''}`}
              >
                {saveSuccess ? 'Salvo!' : 'Salvar NPC'}
              </button>
            </div>
          </div>
          
          <div className="npc-description">
            <p>{npc.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NPCGenerator; 