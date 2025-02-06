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

    let prompt = `<|system|>Você é uma API REST que retorna apenas JSON. Não adicione nada além do JSON. Gere um NPC detalhado para RPG com os seguintes campos obrigatórios, seguindo EXATAMENTE o formato especificado:

INSTRUÇÕES IMPORTANTES:
1. Cada campo deve conter o número mínimo de caracteres especificado
2. Não inclua aspas extras ou caracteres especiais
3. Mantenha o formato JSON válido
4. Characteristics deve listar pelo menos 3 habilidades ou competências específicas
5. Quirks deve listar pelo menos 2 maneirismos ou peculiaridades únicas

<|format|>
{
  "name": "Nome completo do personagem (mínimo 3 caracteres)",
  "appearance": "Descrição física detalhada incluindo altura, peso, características marcantes, vestimentas e outros detalhes visuais relevantes (mínimo 50 caracteres)",
  "personality": "Descrição da personalidade incluindo temperamento, atitudes, crenças e comportamentos típicos (mínimo 50 caracteres)",
  "background": "História de vida detalhada incluindo origem, eventos importantes e motivações atuais (mínimo 100 caracteres)",
  "characteristics": "Lista detalhada de pelo menos 3 habilidades e competências principais, incluindo proficiências, talentos especiais e áreas de expertise (mínimo 50 caracteres)",
  "statGuide": "Sugestões numéricas ou qualitativas de atributos principais e secundários relevantes para o sistema (mínimo 50 caracteres)",
  "quirks": "Lista de pelo menos 2 maneirismos únicos, tiques nervosos, hábitos peculiares ou características distintivas de comportamento (mínimo 30 caracteres)"
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
          max_new_tokens: 1200,
          temperature: 0.8,
          top_p: 0.95,
          top_k: 40,
          repetition_penalty: 1.1,
          return_full_text: false,
          stop: ["<", "\n\n", "```"],
          seed: generateRandomSeed(),
        },
      });

      console.log('Resposta bruta da IA:', response);

      try {
        let cleanText = response.generated_text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres de largura zero
          .trim();

        // Encontra o primeiro '{' e último '}'
        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Formato de resposta inválido: JSON não encontrado');
        }

        const jsonStr = cleanText.substring(startIndex, endIndex + 1);
        console.log('JSON encontrado:', jsonStr);

        const generatedNPC = JSON.parse(jsonStr);

        // Validação detalhada dos campos com mensagens específicas
        const validations = {
          name: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 3) return 'deve ter pelo menos 3 caracteres';
            return null;
          },
          appearance: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 50) return 'deve ter pelo menos 50 caracteres';
            return null;
          },
          personality: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 50) return 'deve ter pelo menos 50 caracteres';
            return null;
          },
          background: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 100) return 'deve ter pelo menos 100 caracteres';
            return null;
          },
          characteristics: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 50) return 'deve ter pelo menos 50 caracteres';
            if (!val.includes(',') && !val.includes(';')) return 'deve listar pelo menos 3 habilidades separadas por vírgula';
            return null;
          },
          statGuide: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 50) return 'deve ter pelo menos 50 caracteres';
            return null;
          },
          quirks: (val) => {
            if (typeof val !== 'string') return 'deve ser uma string';
            if (val.trim().length < 30) return 'deve ter pelo menos 30 caracteres';
            if (!val.includes(',') && !val.includes(';')) return 'deve listar pelo menos 2 peculiaridades separadas por vírgula';
            return null;
          }
        };

        const invalidFields = [];
        const validationMessages = [];

        Object.entries(validations).forEach(([field, validator]) => {
          const error = validator(generatedNPC[field]);
          if (error) {
            invalidFields.push(field);
            validationMessages.push(`${field}: ${error}`);
          }
        });

        if (invalidFields.length > 0) {
          console.error('Campos inválidos:', invalidFields);
          console.error('Detalhes da validação:', validationMessages);
          console.error('Valores dos campos:', invalidFields.reduce((acc, field) => ({
            ...acc,
            [field]: generatedNPC[field]
          }), {}));
          
          throw new Error(`Campos inválidos ou incompletos: ${invalidFields.join(', ')}. ${validationMessages.join('; ')}`);
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
        console.error('Erro detalhado:', parseError);
        setError(`Erro ao processar a resposta da IA: ${parseError.message}. Por favor, tente novamente.`);
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