
/**
 * @param func 
 * @param wait 
 * @returns 
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
  
    const debounced = ((...args: Parameters<T>) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    }) as T;
  
    return debounced;
  }
  