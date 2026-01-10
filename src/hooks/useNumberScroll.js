import { useCallback, useRef, useEffect } from 'react';
import { disablePageScroll, enablePageScroll } from '../utils/scrollUtils';

/**
 * Hook que retorna handlers para adicionar funcionalidade de scroll do mouse
 * em inputs do tipo number e desabilitar scroll da página
 * @param {Function} onChangeHandler - Função que atualiza o valor (recebe o novo valor como número)
 * @param {number} currentValue - Valor atual do input
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @param {number} step - Incremento/decremento (padrão: 1)
 * @returns {Object} Objeto com handlers onWheel, onMouseEnter e onMouseLeave
 */
export const useNumberScroll = (onChangeHandler, currentValue, min, max, step = 1) => {
  const isMouseOver = useRef(false);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const current = parseInt(currentValue) || 0;
    const delta = e.deltaY > 0 ? -step : step;
    let newValue = current + delta;
    
    // Aplica limites min/max se especificados
    if (min !== undefined && min !== null) {
      newValue = Math.max(min, newValue);
    }
    if (max !== undefined && max !== null) {
      newValue = Math.min(max, newValue);
    }
    
    // Atualiza o valor apenas se mudou
    if (newValue !== current) {
      onChangeHandler(newValue);
    }
  }, [onChangeHandler, currentValue, min, max, step]);

  const handleMouseEnter = useCallback(() => {
    isMouseOver.current = true;
    disablePageScroll();
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseOver.current = false;
    enablePageScroll();
  }, []);

  // Limpa o estado quando o componente desmonta
  useEffect(() => {
    return () => {
      if (isMouseOver.current) {
        enablePageScroll();
      }
    };
  }, []);

  return {
    onWheel: handleWheel,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };
};
