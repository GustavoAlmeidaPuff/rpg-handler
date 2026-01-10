import { useCallback } from 'react';

/**
 * Hook que retorna um handler para adicionar funcionalidade de scroll do mouse
 * em inputs do tipo number
 * @param {Function} onChangeHandler - Função que atualiza o valor (recebe o novo valor como número)
 * @param {number} currentValue - Valor atual do input
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @param {number} step - Incremento/decremento (padrão: 1)
 * @returns {Function} Handler para o evento onWheel
 */
export const useNumberScroll = (onChangeHandler, currentValue, min, max, step = 1) => {
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
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

  return handleWheel;
};
