import { useState } from 'react';

const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (text) => {
    try {
      // Construir a URL com os parâmetros
      const url = new URL('https://api.mymemory.translated.net/get');
      url.searchParams.append('q', text);
      url.searchParams.append('langpair', 'en|pt-BR');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translateSpell = async (spell) => {
    setIsTranslating(true);
    try {
      // Traduzir escola de magia
      const translatedSchool = await translateText(spell.school.name);

      const translatedSpell = {
        ...spell,
        name: await translateText(spell.name),
        casting_time: await translateText(spell.casting_time),
        range: await translateText(spell.range),
        duration: await translateText(spell.duration),
        desc: await Promise.all(spell.desc.map(text => translateText(text))),
        school: {
          ...spell.school,
          name: translatedSchool
        }
      };

      if (spell.higher_level) {
        translatedSpell.higher_level = await Promise.all(
          spell.higher_level.map(text => translateText(text))
        );
      }

      return translatedSpell;
    } catch (error) {
      console.error('Error translating spell:', error);
      return spell;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translateSpell,
    isTranslating,
  };
};

export default useTranslation; 