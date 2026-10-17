import { useEffect, useState } from 'react';

// Devuelve el texto (sin espacios a los lados) recién cuando deja de cambiar durante `delay` ms.
// Se usa en los buscadores para no pedir al backend en cada tecla
export function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
