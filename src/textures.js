import { range, seedRand } from './misc';
const enemyTypes = 15;
export const enemyPatterns = [];
const planetTypes = 50;
export const planetPatterns = [];
const getEnemyPattern = (color, seed) => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 40;
  patternCanvas.height = 40;

  // Give the pattern a background color
  patternContext.fillStyle = color;
  patternContext.fillRect(0, 0, 40, 40);

  const rand = seedRand(seed + 1);
  for (let x = 0, y = 0; y < 40; ) {
    const w = Math.floor(rand() * 7 + 2);
    patternContext.fillStyle = rand() < 0.5 ? '#333' : '#222';
    patternContext.fillRect(x, y, w, Math.floor(rand() * 7 + 2));
    x += 1 + w;
    if (x > 40) {
      y += 5;
      x = 0;
    }
  }
  return patternCanvas;
};
const planetColors = ['#01b7e7', '#ffb141', '#cdccca', '#8db9de', '#f54c23', '#ffb22b', '#ca5c3b', '#99ecfc', '#b7b6b4'];
const getPlanetPattern = seed => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 300;
  patternCanvas.height = 300;

  // Give the pattern a background color
  patternContext.fillStyle = '#b7b6b4';
  patternContext.fillRect(0, 0, 300, 300);

  const rand = seedRand(seed + 1);
  range(40).forEach(() => {
    patternContext.fillStyle = planetColors[Math.floor(rand() * planetColors.length)];
    const [x, y, ex, ey] = range(8).map(() => Math.floor(rand() * 250 + 50));
    const [r1, r2, r3, r4] = range(8).map(() => Math.floor(rand() * 50 + 10));
    patternContext.moveTo(x, y);
    patternContext.bezierCurveTo(x + r1, y + r2, ex + r3, ey + r4, ex, ey);
    patternContext.moveTo(ex, ey);
    patternContext.bezierCurveTo(ex - r1, ey - r2, x - r3, y - r4, x, y);
    patternContext.fill();
  });
  return patternCanvas;
};
const init = context => {
  range(enemyTypes)
    .reduce((t, x) => [...t, ...['#080', '#00f', '#d00'].map(color => getEnemyPattern(color, x))], [])
    .map(x => context.createPattern(x, null))
    .forEach(x => enemyPatterns.push(x));
  range(planetTypes)
    .map(x => getPlanetPattern(x))
    .map(x => context.createPattern(x, null))
    .forEach(x => planetPatterns.push(x));
};
export default init;
