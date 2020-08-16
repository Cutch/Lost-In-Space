import { GameObject, keyPressed } from 'kontra';
import { distanceToTarget, text, distance } from './misc';
import Bullet from './bullet';
import { fireSound, engineSoundOff, engineSoundOn } from './sound';
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

  constructor(cockpit) {
    super({
      width: 60,
      height: 60,
      mw: 30, // Half Width
      mh: 30, // Half Height
      speedX: 0,
      speedY: 0,
      health: 100
    });
    const _this = this;
    const ctx = _this.context;
    _this.cockpit = cockpit;
    // Engine fire gradient
    _this.fireGrad = ctx.createLinearGradient(0, _this.mh, 0, _this.mh + 20);
    _this.fireGrad.addColorStop(0, '#f00');
    _this.fireGrad.addColorStop(0.5, '#600');
    // Ship texture
    _this.shipGrad = ctx.createLinearGradient(-40, 0, 40, 0);
    _this.shipGrad.addColorStop(0.0, '#000');
    _this.shipGrad.addColorStop(0.5, '#fff');
    _this.shipGrad.addColorStop(1, '#000');

    // x,y point path of ship
    _this.shipPath = [
      0,
      -_this.mh,
      -_this.mw / 4,
      -_this.mh / 2,
      -_this.mw / 3,
      0,
      -_this.mw,
      _this.mh / 2,
      -_this.mw,
      _this.mh * 0.9,
      -_this.mw / 2,
      _this.mh,
      _this.mw / 2,
      _this.mh,
      _this.mw,
      _this.mh * 0.9,
      _this.mw,
      _this.mh / 2,
      _this.mw / 3,
      0,
      _this.mw / 4,
      -_this.mh / 2
    ];
    _this.upgrades = [
      [20, () => (_this.fireRate = 15), text.fireRateUpdated],
      [40, () => ((_this.maxShipSpeed = 5.5), _this.engineLevel++), text.maxSpeed],
      [60, () => (_this.fireRate = 10), text.fireRateUpdated],
      [80, () => ((_this.maxShipSpeed = 6.5), _this.engineLevel++), text.maxSpeed],
      [100, () => (_this.fireRate = 5), text.fireRateUpdated],
      [120, () => ((_this.maxShipSpeed = 7.5), _this.engineLevel++), text.maxSpeed],
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
    ctx.fillStyle = _this.shipGrad;
    ctx.beginPath();
    for (let i = 0; i < _this.shipPath.length; i += 2) ctx.lineTo(_this.shipPath[i], _this.shipPath[i + 1]);
    ctx.fill();
    if (_this.showExhaust) {
      // Generate Exhaust
      ctx.fillStyle = _this.fireGrad;
      ctx.beginPath();
      const r = Math.random();
      const multiplier = Math.floor(Math.pow(_this.maxShipSpeed / 2, 2) * 2);
      for (let i = 0; i <= 12; i++) {
        ctx.lineTo(
          -_this.mw / 2 + (_this.width / 2 / 12) * i,
          _this.mh + (i % 2) * (multiplier * 2 - r * multiplier * Math.sqrt(Math.abs(i / 2 - 3)))
        );
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
    if (keyPressed('a')) {
      _this.rotation = _this.rotation - 0.05;
    }
    if (keyPressed('d')) {
      _this.rotation = _this.rotation + 0.05;
    }
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
