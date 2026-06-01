import { nouns } from '../data/nouns.json';
import { adjectives } from '../data/adjectives.json';
import { rules } from '../rules/genitive.json';

export function generateEndingChoice() {
  const word = nouns[Math.floor(Math.random() * nouns.length)];
  const rule = rules.pattern.replace('{word}', word);

  return {
    prompt: `Выберите правильное окончание: ${rule}`,
    options: [
      `${word}ы`,
      `${word}а`,
      `${word}у`,
      `${word}е`
    ],
    answer: `${word}ы`
  };
}