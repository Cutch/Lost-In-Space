import { GameObject, keyPressed } from 'kontra';
import { distanceToTarget, text, magnitude, range } from './misc';
import Bullet from './bullet';
import { fireSound, engineSoundOff, engineSoundOn, crashSound } from './sound';
import { getStory } from './story';
// x,y point path of ship
const shipPath = [30, 0, 22.5, 15, 20, 30, 0, 45, 0, 57, 15, 60, 45, 60, 60, 57, 60, 45, 40, 30, 37.5, 15];
const triangle = (ctx, x1, y1, x2, y2, x3, y3 = y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
};
const getPattern = () => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 60;
  patternCanvas.height = 60;

  patternContext.fillStyle = '#888';
  patternContext.fillRect(0, 0, 60, 60);
  patternContext.fillStyle = '#444';
  triangle(patternContext, 40, 30, 50, 60, 80);
  triangle(patternContext, 20, 30, 10, 60, -20);
  patternContext.fillStyle = '#777';
  triangle(patternContext, 30, 5, 20, 50, 40);
  patternContext.fillStyle = '#666';
  triangle(patternContext, 30, 5, 20, 40, 40);
  patternContext.fillStyle = '#222';
  triangle(patternContext, 30, 15, 25, 35, 35);
  patternContext.fillStyle = '#AAA';
  range(4).forEach(i => {
    triangle(patternContext, i * 10 + 15, 50, i * 10 + 10, 60, i * 10 + 20);
  });
  return patternCanvas;
};
class Ship extends GameObject.class {
  acceleration = 0.05; // acceleration of the ship
  rotationAcceleration = 0.05; // Rotation speed of the ship
  maxSpeed = 4; // Max Speed of the ship
  hasWarp = false; // Used for first play through for the win condition
  showExhaust = false; // Engine is firing
  bullets = []; // Active bullets
  fireRate = 20; // Bullet fire interval, every x ticks
  lastFire = -99; // Initial value is negative of fire rate
  secondaryWeapons = false;
  secondaryFireRate = 15; // Bullet fire interval, every x ticks
  lastSecondaryFire = -99;
  level = 1; // Ship's level
  engineLevel = 1; // Ship's level
  day = 0; // Days based on ticks
  scrap = 0; // Scrap collected
  rotating = false;
  constructor(cockpit, maxScrap) {
    super({
      width: 60,
      height: 60,
      speedX: 0,
      speedY: 0,
      health: 100,
      anchor: { x: 0.5, y: 0.5 }
    });
    const _this = this;
    const ctx = _this.context;
    _this.cockpit = cockpit;
    // Engine fire gradient
    _this.fireGrad = ctx.createLinearGradient(0, 0, 0, 80);
    _this.fireGrad.addColorStop(0.6, '#f00');
    _this.fireGrad.addColorStop(1, '#600');
    // Ship texture
    _this.color = this.context.createPattern(getPattern(), 'repeat');
    const chapter = getStory(maxScrap);

    // Set a list of upgrades and what they do
    _this.upgrades = [
      [20, () => (_this.fireRate = 15), text.fireRateUpdated],
      [40, () => ((_this.maxSpeed = 5), _this.engineLevel++), text.maxSpeed],
      [60, () => (_this.fireRate = 10), text.fireRateUpdated],
      [80, () => ((_this.maxSpeed = 6), _this.engineLevel++), text.maxSpeed],
      [120, () => (_this.fireRate = 5), text.fireRateUpdated],
      [140, () => ((_this.maxSpeed = 7), _this.engineLevel++), text.maxSpeed],
      [200, () => (_this.acceleration = 0.08), text.acceleration],
      [250, () => ((_this.maxSpeed = 9), _this.engineLevel++), text.maxSpeed],
      [300, () => (_this.secondaryWeapons = true), text.secondaryWeapons],
      [350, () => (_this.rotationAcceleration = 0.08), text.rotationSpeed],
      [400, () => (_this.fireRate = 4), text.fireRateUpdated],
      [450, () => (_this.secondaryFireRate = 10), text.secondaryFireRateUpdated],
      [550, () => (_this.fireRate = 3), text.fireRateUpdated],
      [600, () => (_this.acceleration = 0.1), text.acceleration],
      [650, () => (_this.secondaryFireRate = 7), text.secondaryFireRateUpdated],
      [750, () => (_this.fireRate = 2), text.fireRateUpdated],
      [800, () => (_this.rotationAcceleration = 0.1), text.rotationSpeed],
      [850, () => (_this.secondaryFireRate = 5), text.secondaryFireRateUpdated],
      [950, () => (_this.secondaryFireRate = 4), text.secondaryFireRateUpdated]
    ];
    // If already won dont add the win condition

    if (chapter.scrap) {
      const gameWinUpgrade = [chapter.scrap, () => (_this.hasWarp = true), chapter.gameWinStatus];
      const i = _this.upgrades.findIndex(x => x[0] >= chapter.scrap);
      if (i === -1) _this.upgrades.push(gameWinUpgrade);
      if (_this.upgrades[i][0] == chapter.scrap) _this.upgrades[i] = gameWinUpgrade;
      else _this.upgrades.splice(i, 0, gameWinUpgrade);
    }
    console.log(this.upgrades);
    // Listen for enemies hit, by ship or bullets
    ctx.canvas.addEventListener('eh', () => {
      _this.scrap++;
      _this.upgrades.forEach(([scrap, func, text]) => {
        if (scrap === _this.scrap) {
          _this.level++;
          func();
          cockpit.addStatus(text);
        }
      });
      /**
       * Heal ship every 100 scrap
       * Or every 50 after 400 scrap
       */
      if (!_this.hasWarp && (_this.scrap % 100 === 0 || (_this.scrap > 400 && _this.scrap % 50 === 0))) {
        _this.level++;
        _this.health = Math.min(100, _this.health + 50);
        cockpit.addStatus(text.repair);
      }
    });
  }
  draw() {
    const _this = this;
    // Generate Ship
    const ctx = _this.context;
    ctx.fillStyle = _this.color;
    ctx.beginPath();
    for (let i = 0; i < shipPath.length; i += 2) ctx.lineTo(shipPath[i], shipPath[i + 1]);
    ctx.fill();
    if (_this.showExhaust) {
      // Generate Exhaust
      ctx.fillStyle = _this.fireGrad;
      ctx.beginPath();
      const r = Math.random();
      const multiplier = Math.floor(Math.pow(_this.maxSpeed / 2, 2) * 2);
      // 0-12 incl 12
      range(13).forEach(i =>
        ctx.lineTo(15 + (_this.width / 2 / 12) * i, 60 + (i % 2) * (multiplier * 2 - r * multiplier * Math.sqrt(Math.abs(i / 2 - 3))))
      );
      ctx.fill();
    }
  }
  render() {
    super.render();
    this.bullets.forEach(b => b.render());
  }
  update(enemies, planets, tick) {
    const _this = this;
    // Update Bullets
    _this.bullets.forEach((b, i) => {
      // Check if bullets have gone too far or hit an enemy, remove if so
      if (b.tick < tick - 80 || b.hit) _this.bullets.splice(i, 1);
      else b.update(enemies, planets);
    });
    // Check if it is a new day, day is 10 seconds
    _this.day = Math.floor(tick / 600);
    // Check if ship crashed into an enemy
    enemies
      .filter(e => distanceToTarget({ x: _this.x, y: _this.y }, e) < 55)
      .forEach(hitEnemy => {
        crashSound();
        _this.health -= 10;
        _this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: hitEnemy }));
      });
    // Show exhaust when forward is clicked, see index for movement
    const prevShowExhaust = _this.showExhaust;
    _this.showExhaust = keyPressed('w');
    if (_this.showExhaust && !prevShowExhaust) engineSoundOn(_this.engineLevel);
    else if (!_this.showExhaust && prevShowExhaust) engineSoundOff();
    if (keyPressed('space')) {
      let fired = false;
      if (tick - _this.lastFire >= _this.fireRate) {
        fired = true;
        _this.lastFire = tick;
        _this.fire(tick);
      }
      if (_this.secondaryWeapons && tick - _this.lastSecondaryFire >= _this.secondaryFireRate) {
        fired = true;
        _this.lastSecondaryFire = tick;
        _this.secondaryFire(tick);
      }
      if (fired) fireSound();
    }
    // Update the ship's speed on key press
    if (keyPressed('w')) {
      _this.speedX += -Math.sin(_this.rotation) * _this.acceleration;
      _this.speedY += Math.cos(_this.rotation) * _this.acceleration;
      const speed = magnitude(_this.speedX, _this.speedY);
      // Ensure ship does not go over current max speed
      if (speed > _this.maxSpeed) {
        _this.speedX *= _this.maxSpeed / speed;
        _this.speedY *= _this.maxSpeed / speed;
      }
    }

    // Rotate on key press
    // Do a half turn on first key press
    const angle = _this.rotationAcceleration / (_this.rotating ? 1 : 2);
    if (keyPressed('a')) {
      _this.rotation = _this.rotation - angle;
      _this.rotating = true;
    } else if (keyPressed('d')) {
      _this.rotation = _this.rotation + angle;
      _this.rotating = true;
    } else this.rotating = false;
  }
  fire(tick) {
    const _this = this;
    const sin = Math.sin(_this.rotation);
    const cos = Math.cos(_this.rotation);
    _this.bullets.push(
      new Bullet({
        dx: sin * 10,
        dy: -cos * 10,
        x: _this.x + sin * 40,
        y: _this.y - cos * 40,
        rotation: _this.rotation,
        tick
      })
    );
  }
  secondaryFire(tick) {
    const _this = this;
    const sin = Math.sin(_this.rotation);
    const cos = Math.cos(_this.rotation);
    _this.bullets.push(
      new Bullet({
        dx: sin * 15,
        dy: -cos * 15,
        x: _this.x + sin * -5 - cos * 30,
        y: _this.y - cos * -5 - sin * 30,
        rotation: _this.rotation,
        tick
      })
    );
    _this.bullets.push(
      new Bullet({
        dx: sin * 15,
        dy: -cos * 15,
        x: _this.x + sin * -5 + cos * 30,
        y: _this.y - cos * -5 + sin * 30,
        rotation: _this.rotation,
        tick
      })
    );
  }
}
export default Ship;
