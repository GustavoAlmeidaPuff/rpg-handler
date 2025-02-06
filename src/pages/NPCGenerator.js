import React, { useState, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './npcgenerator.css';
import '../styles/global.css';

function NPCGenerator() {
  const [theme, setTheme] = useState('');
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

  const generatePrompt = (theme) => {
    const randomTraits = [
      'ambicioso', 'cauteloso', 'corajoso', 'criativo', 'curioso',
      'determinado', 'divertido', 'empático', 'energético', 'focado',
      'gentil', 'honesto', 'humilde', 'idealista', 'inteligente',
      'leal', 'metódico', 'otimista', 'paciente', 'pragmático'
    ];

    const randomTrait = randomTraits[Math.floor(Math.random() * randomTraits.length)];
    const randomAge = Math.floor(Math.random() * 50) + 20;
    const randomSeed = generateRandomSeed();

    let prompt = `<|system|>Você é uma API que gera NPCs de RPG. Retorne apenas JSON válido.

REGRAS:
1. IMPORTANTE: Siga ESTRITAMENTE a temática "${theme}"
2. Use elementos, termos e referências ESPECÍFICAS da temática
3. Mantenha respostas curtas e diretas
4. Use vírgulas para separar itens
5. Gere exatamente 3 características e 3 peculiaridades

${theme === 'Fantasia Medieval' ? `EXEMPLO PARA FANTASIA MEDIEVAL:
{
  "name": "Sir Galahad Blackforge",
  "appearance": "Cavaleiro alto e musculoso, armadura de placas com brasão de dragão, cicatriz de batalha no rosto",
  "personality": "Honrado e leal, segue o código da cavalaria, protege os mais fracos",
  "background": "Filho de um ferreiro, treinou na ordem dos cavaleiros do dragão, jurou proteger o reino contra as forças das trevas",
  "characteristics": "Mestre espadachim, Montaria experiente, Estrategista de batalha",
  "statGuide": "Força 16, Destreza 14, Constituição 15, Inteligência 12, Sabedoria 13, Carisma 14",
  "quirks": "Sempre limpa sua espada após usar, Reza antes de cada batalha, Coleciona brasões de ordens de cavalaria"
}` : theme === 'Cyberpunk' ? `EXEMPLO PARA CYBERPUNK:
{
  "name": "Zero-X 'Neon' Rodriguez",
  "appearance": "Corpo 60% cibernético, cabelos com implantes LED, jaqueta de couro com circuitos expostos",
  "personality": "Frio e calculista, vive pelo código das ruas, confia apenas em dados",
  "background": "Ex-agente corporativo, teve corpo destruído em missão, reconstruído com tecnologia experimental",
  "characteristics": "Hacker neural avançado, Especialista em implantes, Infiltração cibernética",
  "statGuide": "Interface 18, Reflexos 16, Tecnologia 17, Combate 14, Furtividade 15, Influência 12",
  "quirks": "Interface neural visível pulsa quando nervoso, Fala com suas IAs, Vício em atualizações de hardware"
}` : theme === 'Espacial/Sci-Fi' ? `EXEMPLO PARA ESPACIAL/SCI-FI:
{
  "name": "Cmdr. Lyra Starweaver",
  "appearance": "Uniforme da frota estelar, implante ocular brilhante, postura militar impecável",
  "personality": "Disciplinada e analítica, fascinada por novas descobertas, liderança natural",
  "background": "Formada na Academia Espacial, veterana de guerras interplanetárias, comandante de nave exploradora",
  "characteristics": "Piloto estelar, Diplomacia alienígena, Navegação espacial",
  "statGuide": "Pilotagem 16, Ciência 15, Diplomacia 14, Tática 16, Tecnologia 15, Liderança 14",
  "quirks": "Sempre consulta o computador de bordo, Coleciona artefatos alienígenas, Insônia em gravidade zero"
}` : `EXEMPLO GENÉRICO:
{
  "name": "Nome temático apropriado",
  "appearance": "Descrição física com elementos visuais da temática",
  "personality": "Personalidade moldada pelo ambiente temático",
  "background": "História conectada ao mundo temático",
  "characteristics": "Três habilidades relevantes à temática",
  "statGuide": "Atributos apropriados ao cenário",
  "quirks": "Três maneirismos únicos relacionados ao tema"
}`}

<|input|>
{
  "theme": "${theme}",
  "tendency": "${randomTrait}",
  "age": ${randomAge}
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
      const prompt = generatePrompt(theme);

      const response = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.75,
          top_k: 35,
          repetition_penalty: 1.1,
          return_full_text: false,
          stop: ["<", "\n\n", "```"],
          seed: generateRandomSeed(),
        },
      });

      try {
        let cleanText = response.generated_text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/;/g, ',')
          .trim();

        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Formato de resposta inválido: JSON não encontrado');
        }

        const jsonStr = cleanText.substring(startIndex, endIndex + 1);
        const generatedNPC = JSON.parse(jsonStr);

        // Validação simplificada
        const validations = {
          name: (val) => val?.trim().length >= 3 ? null : 'nome inválido',
          appearance: (val) => val?.trim().length >= 20 ? null : 'aparência muito curta',
          personality: (val) => val?.trim().length >= 20 ? null : 'personalidade muito curta',
          background: (val) => val?.trim().length >= 30 ? null : 'história muito curta',
          characteristics: (val) => {
            const items = val?.trim().split(',').filter(i => i.trim().length > 0) || [];
            return items.length === 3 ? null : 'precisa ter exatamente 3 características';
          },
          statGuide: (val) => val?.trim().length >= 20 ? null : 'guia de atributos muito curto',
          quirks: (val) => {
            const items = val?.trim().split(',').filter(i => i.trim().length > 0) || [];
            return items.length === 3 ? null : 'precisa ter exatamente 3 peculiaridades';
          }
        };

        const errors = Object.entries(validations)
          .map(([field, validator]) => ({
            field,
            error: validator(generatedNPC[field])
          }))
          .filter(({error}) => error !== null);

        if (errors.length > 0) {
          const errorMessages = errors.map(({field, error}) => `${field}: ${error}`);
          throw new Error(`Campos inválidos: ${errorMessages.join('; ')}`);
        }

        // Limpa e formata os campos
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