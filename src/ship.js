import { GameObject, keyPressed } from 'kontra';
import { distanceToTarget, text, distance, seedRand } from './misc';
import Bullet from './bullet';
import { fireSound, engineSoundOff, engineSoundOn, crashSound } from './sound';
// x,y point path of ship
const shipPath = [30, 0, 22.5, 15, 20, 30, 0, 45, 0, 57, 15, 60, 45, 60, 60, 57, 60, 45, 40, 30, 37.5, 15];
const triangle = (ctx, x1, y1, x2, y2, x3, y3) => {
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

  // Give the pattern a background color
  // const shipGrad = patternContext.createLinearGradient(0, 0, 60, 0);
  // shipGrad.addColorStop(0.0, '#fff');
  // shipGrad.addColorStop(0.5, '#000');
  // shipGrad.addColorStop(1, '#fff');
  patternContext.fillStyle = '#888';
  patternContext.fillRect(0, 0, 60, 60);
  patternContext.fillStyle = '#444';
  triangle(patternContext, 40, 30, 50, 60, 80, 60);
  triangle(patternContext, 20, 30, 10, 60, -20, 60);
  patternContext.fillStyle = '#666';
  triangle(patternContext, 30, 5, 20, 40, 40, 40);
  patternContext.fillStyle = '#222';
  triangle(patternContext, 30, 15, 25, 35, 35, 35);
  // triangle(patternContext, '#222', 60, -30, 50, 30, 40, 30);
  return patternCanvas;
};
class Ship extends GameObject.class {
  maxShipSpeed = 4;
  hasWarp = false;
  showExhaust = false; // Engine is firing
  bullets = []; // Active bullets
  fireRate = 20; // Bullet fire interval, every x ticks
  lastFire = -20; // Initial value is negative of fire rate
  level = 1; // Ship's level
  engineLevel = 1; // Ship's level
  day = 0; // Days based on ticks
  scrap = 0; // Scrap collected
  rotating = false;
  constructor(cockpit) {
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

    _this.upgrades = [
      [20, () => (_this.fireRate = 15), text.fireRateUpdated],
      [40, () => ((_this.maxShipSpeed = 5.5), _this.engineLevel++), text.maxSpeed],
      [60, () => (_this.fireRate = 10), text.fireRateUpdated],
      [80, () => ((_this.maxShipSpeed = 6.5), _this.engineLevel++), text.maxSpeed],
      [100, () => (_this.health = Math.min(100, _this.health + 50)), text.repair],
      [120, () => (_this.fireRate = 5), text.fireRateUpdated],
      [140, () => ((_this.maxShipSpeed = 7.5), _this.engineLevel++), text.maxSpeed],
      [200, () => (_this.hasWarp = true), text.warpDrive]
    ];
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
      const multiplier = Math.floor(Math.pow(_this.maxShipSpeed / 2, 2) * 2);
      for (let i = 0; i <= 12; i++) {
        ctx.lineTo(15 + (_this.width / 2 / 12) * i, 60 + (i % 2) * (multiplier * 2 - r * multiplier * Math.sqrt(Math.abs(i / 2 - 3))));
      }
      ctx.fill();
    }
  }
  render() {
    super.render();
    this.bullets.forEach(b => b.render());
  }
  update(enemies, tick) {
    const _this = this;
    // Update Bullets
    _this.bullets.forEach((b, i) => {
      // Check if bullets have gone too far or hit an enemy, remove if so
      if (b.tick < tick - 60 || b.hit) _this.bullets.splice(i, 1);
      else b.update(enemies);
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
    if (keyPressed('space') && tick - _this.lastFire >= _this.fireRate) {
      fireSound();
      _this.lastFire = tick;
      _this.fire(tick);
    }
    // Update the ship's speed on key press
    if (keyPressed('w')) {
      _this.speedX += -Math.sin(_this.rotation) * 0.05;
      _this.speedY += Math.cos(_this.rotation) * 0.05;
      const speed = distance(_this.speedX, _this.speedY);
      // Ensure ship does not go over current max speed
      if (speed > _this.maxShipSpeed) {
        _this.speedX *= _this.maxShipSpeed / speed;
        _this.speedY *= _this.maxShipSpeed / speed;
      }
    }
    // Rotate on key press
    const angle = 0.05 / (this.rotating ? 1 : 2);
    if (keyPressed('a')) {
      _this.rotation = _this.rotation - angle;
      this.rotating = true;
    } else if (keyPressed('d')) {
      _this.rotation = _this.rotation + angle;
      this.rotating = true;
    } else this.rotating = false;
  }
  fire(tick) {
    const _this = this;
    _this.bullets.push(
      new Bullet({
        dx: Math.sin(_this.rotation) * 10,
        dy: -Math.cos(_this.rotation) * 10,
        x: _this.x + Math.sin(_this.rotation) * 40,
        y: _this.y - Math.cos(_this.rotation) * 40,
        rotation: _this.rotation,
        tick
      })
    );
  }
}
export default Ship;
