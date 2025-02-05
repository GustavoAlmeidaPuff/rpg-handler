import React, { useState, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './npcgenerator.css';
import '../styles/global.css';

function NPCGenerator() {
  const [theme, setTheme] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [desiredTraits, setDesiredTraits] = useState('');
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

  const formatNPCToText = (npc) => {
    return `Nome: ${npc.name}

Aparência:
${npc.appearance}

Personalidade:
${npc.personality}

História:
${npc.background}

Características:
${npc.characteristics}

Guia de Atributos:
${npc.statGuide}

Peculiaridades:
${npc.quirks}`;
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

  const generatePrompt = (theme, description, traits) => {
    const randomTraits = [
      'ambicioso', 'cauteloso', 'corajoso', 'criativo', 'curioso',
      'determinado', 'divertido', 'empático', 'energético', 'focado',
      'gentil', 'honesto', 'humilde', 'idealista', 'inteligente',
      'leal', 'metódico', 'otimista', 'paciente', 'pragmático'
    ];

    const randomTrait = randomTraits[Math.floor(Math.random() * randomTraits.length)];
    const randomAge = Math.floor(Math.random() * 50) + 20;
    const randomSeed = generateRandomSeed();

    let prompt = `<|system|>Você é uma API REST que retorna apenas JSON. Não adicione nada além do JSON.

<|format|>
{
  "name": "string",
  "appearance": "string",
  "personality": "string",
  "background": "string",
  "characteristics": "string",
  "statGuide": "string",
  "quirks": "string"
}

<|input|>
{
  "theme": "${theme}",
  ${description ? `"scenario": "${description}",` : ''}
  ${traits ? `"traits": "${traits}",` : ''}
  "tendency": "${randomTrait}",
  "age": ${randomAge},
  "seed": ${randomSeed}
}

<|output|>`;

    return prompt;
  };

  const handleGenerateNPC = async () => {
    setIsLoading(true);
    setError(null);
    setNpc(null);

    try {
      const hf = new HfInference(process.env.REACT_APP_HUGGINGFACE_TOKEN);
      const prompt = generatePrompt(theme, scenarioDescription, desiredTraits);

      const response = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.1, // Extremamente baixo para forçar consistência
          top_p: 0.1, // Muito restritivo
          top_k: 10, // Muito restritivo
          repetition_penalty: 1.0,
          return_full_text: false,
          stop: ["<", "\n\n", "```"], // Para em tags ou quebras
          seed: generateRandomSeed(),
        },
      });

      console.log('Resposta bruta da IA:', response);
      console.log('Texto gerado:', response.generated_text);

      try {
        // Limpa a resposta
        let cleanText = response.generated_text
          .replace(/```json/g, '') // Remove marcadores de código JSON
          .replace(/```/g, '')     // Remove outros marcadores de código
          .trim();

        // Encontra o primeiro '{' e último '}'
        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
          console.error('Texto limpo sem JSON:', cleanText);
          throw new Error('JSON não encontrado na resposta');
        }

        // Extrai o JSON
        const jsonStr = cleanText.substring(startIndex, endIndex + 1);
        
        console.log('JSON encontrado:', jsonStr);

        // Tenta fazer o parse
        const generatedNPC = JSON.parse(jsonStr);

        // Validação dos campos
        const requiredFields = ['name', 'appearance', 'personality', 'background', 'characteristics', 'statGuide', 'quirks'];
        const invalidFields = requiredFields.filter(field => {
          const value = generatedNPC[field];
          return !value || typeof value !== 'string' || value.trim().length < 5;
        });

        if (invalidFields.length > 0) {
          throw new Error(`Campos inválidos ou incompletos: ${invalidFields.join(', ')}`);
        }

        // Limpa os campos
        Object.keys(generatedNPC).forEach(key => {
          if (typeof generatedNPC[key] === 'string') {
            generatedNPC[key] = generatedNPC[key]
              .trim()
              .replace(/\s+/g, ' ');
          }
        });

        setNpc(generatedNPC);
      } catch (parseError) {
        console.error('Erro ao processar resposta:', parseError);
        if (parseError.message.includes('JSON')) {
          console.log('Tentando processar resposta alternativa...');
          // Se falhar, tenta processar removendo possíveis caracteres problemáticos
          try {
            const cleanerText = response.generated_text
              .replace(/[^\x20-\x7E]/g, '') // Remove caracteres não-ASCII
              .replace(/```/g, '')          // Remove marcadores de código
              .replace(/\n/g, ' ')          // Remove quebras de linha
              .trim();
            
            const jsonMatch = cleanerText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('JSON não encontrado após limpeza');
            }
            
            const generatedNPC = JSON.parse(jsonMatch[0]);
            setNpc(generatedNPC);
          } catch (secondError) {
            setError(`Erro ao processar a resposta da IA: ${parseError.message}. Tente novamente.`);
          }
        } else {
          setError(`Erro ao processar a resposta da IA: ${parseError.message}. Tente novamente.`);
        }
      }
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
        scenarioDescription,
        desiredTraits,
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
          <label>Descrição do Cenário (Opcional)</label>
          <textarea
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
            placeholder="Descreva o cenário onde o NPC está inserido..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Características Desejadas (Opcional)</label>
          <textarea
            value={desiredTraits}
            onChange={(e) => setDesiredTraits(e.target.value)}
            placeholder="Ex: Guerreiro experiente, cicatriz no rosto, especialista em magia"
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
            <h2>{npc.name}</h2>
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