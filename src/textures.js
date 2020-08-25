import { range, seedRand } from './misc';
export let shipPattern;
const enemyTypes = 15;
export const enemyPatterns = [];
const planetTypes = 50;
export const planetPatterns = [];
const triangle = (ctx, x1, y1, x2, y2, x3, y3 = y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
};
const getShipPattern = () => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');
  const shipPath = [30, 0, 22.5, 15, 20, 30, 0, 45, 0, 57, 15, 59, 45, 59, 59, 57, 59, 45, 40, 30, 37.5, 15];

  // Give the pattern a width and height of 50
  patternContext.fillStyle = '#000F';
  patternContext.fillRect(0, 0, 60, 60);

  patternCanvas.width = 60;
  patternCanvas.height = 60;

  patternContext.beginPath();
  patternContext.fillStyle = '#888';
  for (let i = 0; i < shipPath.length; i += 2) patternContext.lineTo(shipPath[i], shipPath[i + 1]);
  patternContext.fill();

  patternContext.fillStyle = '#444';
  triangle(patternContext, 40, 30, 50, 59, 80);
  triangle(patternContext, 20, 30, 10, 59, -20);
  patternContext.fillStyle = '#777';
  triangle(patternContext, 30, 5, 20, 50, 40);
  patternContext.fillStyle = '#666';
  triangle(patternContext, 30, 5, 20, 40, 40);
  patternContext.fillStyle = '#222';
  triangle(patternContext, 30, 15, 25, 35, 35);
  patternContext.fillStyle = '#AAA';
  range(4).forEach(i => {
    triangle(patternContext, i * 10 + 15, 50, i * 10 + 10, 59, i * 10 + 20);
  });
  return patternCanvas;
};
const getEnemyPattern = (color, seed) => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 30;
  patternCanvas.height = 30;

  // Give the pattern a background color
  patternContext.fillStyle = color;
  patternContext.fillRect(0, 0, 30, 30);

  const rand = seedRand(seed + 1);
  for (let x = 0, y = 0; y < 30; ) {
    const w = Math.floor(rand() * 7 + 2);
    patternContext.fillStyle = rand() < 0.5 ? '#333' : '#222';
    patternContext.fillRect(x, y, w, Math.floor(rand() * 7 + 2));
    x += 1 + w;
    if (x > 30) {
      y += 5;
      x = 0;
    }
  }
  const redraw = patternContext.createPattern(patternCanvas, null);
  patternCanvas.width = 40;
  patternCanvas.height = 40;
  patternContext.fillStyle = '#0000';
  patternContext.fillRect(0, 0, 40, 40);

  patternContext.fillStyle = redraw;
  for (let i = 0; i < 10; i++) {
    patternContext.beginPath();
    patternContext.rect(i, i / 2, 30, 30);
    patternContext.strokeWidth = 1;
    patternContext.strokeStyle = '#0008';
    patternContext.fill();
    patternContext.stroke();
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
  shipPattern = context.createPattern(getShipPattern(), null);
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
