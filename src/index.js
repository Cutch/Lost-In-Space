import { init, GameLoop, initKeys, keyPressed, Text } from 'kontra';
import StarField from './starfield';
import Cockpit from './cockpit';
import Ship from './ship';
import Enemy from './enemy';
import GameOver from './gameOver';
import textures from './textures';
import { randomPointOutsideView } from './misc';
import Planets from './planets';
import { getStory } from './story';
const { context, canvas } = init();
textures(context);
/**
 * Track the browser window and resize the canvas
 */
function resize() {
  const c = document.getElementsByTagName('canvas')[0];
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}
window.addEventListener('resize', resize, false);
resize();
initKeys();
let titleText = new Text({
  color: '#600D',
  font: `70px Arial`,
  textAlign: 'center',
  text: 'Lost In Space',
  x: canvas.width / 2,
  y: canvas.height / 4
});
const localStorage = window.localStorage;
const pauseText = new Text({ font: '36px Arial', color: '#fff', text: 'Paused', textAlign: 'center' });
/**
 * Set variables used in the loops
 */
let gameStart;
let gameOver;
let cockpit;
let starField;
let planets;
let ship;
let enemies;
let tick;
let paused;
let maxScrap = localStorage ? localStorage.getItem('lins25_score') || 0 : 0;
/**
 * Initial values for the game start and setup
 */
const initGame = () => {
  gameStart = true;
  gameOver = null;
  cockpit = new Cockpit();
  starField = new StarField();
  ship = new Ship(cockpit, maxScrap);
  paused = false;
  tick = 1;
  enemies = [];
  planets = new Planets();
  const chapter = getStory(maxScrap);
  // gameOver = new GameOver(ship, false, 50);
  chapter.initialText.forEach(t => cockpit.addStatus(t, (Math.max(t.split(' ').length, 6) / 150) * 60000));
};
initGame();

let escapeKeyUp = true;
/**
 * Update the main game loop
 */
const mainGameLoop = () => {
  /**
   * Pause functionality
   */
  if (keyPressed('esc')) {
    if (escapeKeyUp) {
      escapeKeyUp = false;
      paused = !paused;
    }
  } else escapeKeyUp = true;
  // Check if an enemy should spawn
  if (tick % Math.max((30 - ship.day) * 3, 30) === 0) {
    const [x, y] = randomPointOutsideView(canvas);
    /**
     * Determine the possibility for the health
     * After day 3, chance goes up above health 1.
     * Day 23 has the max chance of seeing health 3
     */
    const healthChance = Math.max(Math.min((ship.day - 3) / 20, 1) * 2, 0) + 1;
    enemies.push(
      new Enemy({
        x: x,
        y: y,
        ship,
        health: Math.floor(Math.pow(Math.random(), 2) * healthChance + 1)
      })
    );
  }
  cockpit.update(ship);
  // Block main game loop on pause
  if (paused) return;
  tick++;
  ship.update(enemies, planets, tick);
  // Move the background based on the ship's speed
  starField.dx = ship.speedX;
  starField.dy = ship.speedY;
  starField.update(tick);

  planets.dx = ship.speedX;
  planets.dy = ship.speedY;
  planets.update(enemies, ship, tick);

  enemies.forEach(e => {
    e.dx = ship.speedX;
    e.dy = ship.speedY;
    e.update(enemies, planets);
  });
  if (enemies.length > 50) {
    enemies.splice(
      enemies.reduce(
        (t, e, i) => {
          const dist = e.distanceToShip();
          if (t.max < dist) return { max: dist, i };
          return t;
        },
        { max: 0, i: -1 }
      ).i,
      1
    );
  }
  // Win Condition
  if (ship.hasWarp === 200) {
    setTimeout(() => {
      enemies = [];
      gameOver = new GameOver(ship, true, maxScrap);
      maxScrap = Math.max(maxScrap, ship.scrap); // In case there is no local storage write it for this session
    }, 3000);
  }
};
/**
 * Render the main game loop
 */
const mainGameRender = () => {
  starField.render();
  planets.render();
  enemies.forEach(e => e.render());
  ship.render();
  cockpit.render();
};
/**
 * Render the start of the game loop
 */
let keyUp = true;
const gameStartLoop = () => {
  // Check for messages left in the queue and if there is none left start the game
  if (cockpit.queue.length === 0) gameStart = false;
  cockpit.setSkipHelper(gameStart);
  if (keyPressed('space')) {
    // Only move forward if this is the first update space was pressed
    if (keyUp) {
      keyUp = false; // Set that the key is pressed
      cockpit.getNextStatus();
    }
  } else keyUp = true; // Set the key is up
  cockpit.update(ship);
};
const loop = GameLoop({
  clearCanvas: false,
  // create the main game loop
  update: () => {
    if (gameOver) {
      cockpit.update(ship);
      gameOver.update();
      // Restart the game if enter is pressed
      if (keyPressed('enter')) initGame();
    } else if (!gameStart) mainGameLoop();
    // Keep ship centered
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    pauseText.x = ship.x;
    pauseText.y = ship.y;
    if (titleText) {
      titleText.x = canvas.width / 2;
      titleText.y = canvas.height / 4;
    }
  },
  render: () => {
    mainGameRender();
    if (paused) pauseText.render();
    else if (gameOver) gameOver.render();
    else if (gameStart) gameStartLoop();
    if (titleText) titleText.render();
  }
});
// Listen for enemy hits
canvas.addEventListener('eh', ({ detail }) => {
  // Update the enemy list
  enemies.splice(enemies.indexOf(detail), 1);
  // Check the health of the ship
  if (ship.health <= 0) gameOver = new GameOver(ship, false, maxScrap);
  maxScrap = Math.max(maxScrap, ship.scrap); // In case there is no local storage write it for this session
});
// Start the game loop
loop.start();
setTimeout(() => (titleText = null), 6000);
