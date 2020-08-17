import { init, GameLoop, initKeys, keyPressed, Text } from 'kontra';
import StarField from './starfield';
import Cockpit from './cockpit';
import Ship from './ship';
import Enemy from './enemy';
import GameOver from './gameOver';
const { canvas } = init();
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
/**
 * Set variables used in the loops
 */
let gameStart;
let gameOver;
let cockpit;
let starField;
let ship;
let enemies;
let tick;
/**
 * Initial values for the game start and setup
 */
const initGame = () => {
  gameStart = true;
  gameOver = null;
  cockpit = new Cockpit();
  starField = new StarField();
  ship = new Ship(cockpit);
  tick = 1;
  enemies = [];
  [
    'Me: Where am I?',
    'Computer: Error: 404. Location Not Found.',
    'Me: It looks like I have drifted for 10 warp days. I will have to find my way back.',
    "Me: This may be Corg space, I don't want to get assimil...assinated.",
    'Me: Computer, System Status.',
    'Computer: All systems have been destroyed.',
    'Me: Ugh, now I need some scrap to fix the systems.',
    'Computer: 200t of scrap are needed',
    'Computer: Use my WASD keys to fly and The Bar to shoot.'
  ].forEach(t => cockpit.addStatus(t, (Math.max(t.split(' ').length, 6) / 150) * 60000));
};
initGame();

/**
 * Update the main game loop
 */
const mainGameLoop = () => {
  // Check if an enemy should spawn
  if (tick % Math.max((30 - ship.day) * 3, 30) === 0) {
    /**
     * Generate a spawn location outside of the canvas
     * Initially only the y is guaranteed outside the canvas, [0-1.5, 1-1.5]
     * X,Y are randomly flipped
     */
    const spawn = [Math.random() * 1.5, Math.random() - 0.5];
    spawn[1] = Math.sign(spawn[1]) + spawn[1];
    if (Math.random() > 0.5) spawn.reverse();
    /**
     * Determine the possibility for the health
     * After day 3, chance goes up above health 1.
     * Day 23 has the max chance of seeing health 3
     */

    const healthChance = Math.max(Math.min((ship.day - 3) / 20, 1) * 2, 0) + 1;
    enemies.push(
      new Enemy({
        x: spawn[0] * canvas.width,
        y: spawn[1] * canvas.height,
        ship,
        health: Math.floor(Math.pow(Math.random(), 2) * healthChance + 1)
      })
    );
  }
  tick++;
  ship.update(enemies, tick);
  cockpit.update(ship);
  // Move the background based on the ship's speed
  starField.dx = ship.speedX;
  starField.dy = ship.speedY;
  starField.update();
  enemies.forEach(e => {
    e.dx = ship.speedX;
    e.dy = ship.speedY;
    e.update(enemies);
  });
  // Win Condition
  if (ship.scrap === 200) {
    setTimeout(() => {
      enemies = [];
      gameOver = new GameOver(ship, true);
    }, 3000);
  }
};
/**
 * Render the main game loop
 */
const mainGameRender = () => {
  starField.render();
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
      gameOver.update();
      // Restart the game if enter is pressed
      if (keyPressed('enter')) initGame();
    } else if (!gameStart) mainGameLoop();
    // Keep ship centered
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
  },
  render: () => {
    mainGameRender();
    if (gameOver) gameOver.render();
    else if (gameStart) gameStartLoop();
    if (titleText) titleText.render();
  }
});
// Listen for enemy hits
canvas.addEventListener('eh', ({ detail }) => {
  // Update the enemy list
  enemies.splice(enemies.indexOf(detail), 1);
  // Check the health of the ship
  if (ship.health <= 0) gameOver = new GameOver(ship, false);
});
// Start the game loop
loop.start();
setTimeout(() => (titleText = null), 6000);
