
/**
 * @param query 
 * @param target 
 * @returns 
 */
export function calculateFuzzyScore(query: string, target: string): number {
    if (!query || !target) return 0;
  
    query = query.toLowerCase();
    target = target.toLowerCase();
  
    let score = 0;
    let queryIdx = 0;
    let consecutiveMatches = 0;
  
    for (let i = 0; i < target.length; i++) {
      if (queryIdx < query.length && target[i] === query[queryIdx]) {
        score += 1; 
        consecutiveMatches++;
        queryIdx++;
      } else {
        if (consecutiveMatches > 0) {
          score += consecutiveMatches * 0.5;
        }
        consecutiveMatches = 0;
        if (queryIdx < query.length) {
          score -= 0.1;
        }
      }
    }
  
    if (target.startsWith(query)) {
      score += query.length * 2;
    }
    if (query === target) {
      score += 10;
    }
  
    score -= (query.length - queryIdx) * 0.5;
  
    return Math.max(0, score);
  }
  