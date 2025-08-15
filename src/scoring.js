import vals from '../assets/scrabble-letter-values.js';

export function scoreWord(w) {
  let s = 0;
  w = w.toUpperCase();
  for (const c of w) {
    s += vals[c] || 0;
  }
  return s + Math.max(0, (w.length - 2) ** 2);
}

