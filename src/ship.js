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
  upgrades = [
    [20, () => (this.fireRate = 15), text.fireRateUpdated],
    [40, () => ((this.maxShipSpeed = 5), this.engineLevel++), text.maxSpeed],
    [60, () => (this.fireRate = 10), text.fireRateUpdated],
    [80, () => ((this.maxShipSpeed = 6), this.engineLevel++), text.maxSpeed],
    [100, () => (this.fireRate = 5), text.fireRateUpdated],
    [120, () => ((this.maxShipSpeed = 7), this.engineLevel++), text.maxSpeed],
    [200, () => (this.hasWarp = true), text.warpDrive]
  ];
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
    const ctx = this.context;
    this.cockpit = cockpit;
    // Engine fire gradient
    this.fireGrad = ctx.createLinearGradient(0, this.mh, 0, this.mh + 20);
    this.fireGrad.addColorStop(0, '#f00');
    this.fireGrad.addColorStop(0.5, '#600');
    // Ship texture
    this.shipGrad = ctx.createLinearGradient(-40, 0, 40, 0);
    this.shipGrad.addColorStop(0.0, '#000');
    this.shipGrad.addColorStop(0.5, '#fff');
    this.shipGrad.addColorStop(1, '#000');

    // x,y point path of ship
    this.shipPath = [
      0,
      -this.mh,
      -this.mw / 4,
      -this.mh / 2,
      -this.mw / 3,
      0,
      -this.mw,
      this.mh / 2,
      -this.mw,
      this.mh * 0.9,
      -this.mw / 2,
      this.mh,
      this.mw / 2,
      this.mh,
      this.mw,
      this.mh * 0.9,
      this.mw,
      this.mh / 2,
      this.mw / 3,
      0,
      this.mw / 4,
      -this.mh / 2
    ];
    // Listen for enemies hit, by ship or bullets
    ctx.canvas.addEventListener('enemyHit', () => {
      this.scrap++;
      this.upgrades.forEach(([scrap, func, text]) => {
        if (scrap === this.scrap) {
          this.level++;
          func();
          cockpit.addStatus(text);
        }
      });
    });
  }
  draw() {
    // Generate Ship
    const ctx = this.context;
    ctx.fillStyle = this.shipGrad;
    ctx.beginPath();
    for (let i = 0; i < this.shipPath.length; i += 2) ctx.lineTo(this.shipPath[i], this.shipPath[i + 1]);
    ctx.fill();
    if (this.showExhaust) {
      // Generate Exhaust
      ctx.fillStyle = this.fireGrad;
      ctx.beginPath();
      const r = Math.random();
      for (let i = 0; i <= 12; i++) {
        this.maxShipSpeed * 2;
        ctx.lineTo(
          -this.mw / 2 + (this.width / 2 / 12) * i,
          this.mh + (i % 2) * (this.maxShipSpeed * 4 - r * this.maxShipSpeed * 2 * Math.sqrt(Math.abs(i / 2 - 3)))
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
    // Update Bullets
    this.bullets.forEach((b, i) => {
      // Check if bullets have gone too far or hit an enemy, remove if so
      if (b.tick < tick - 60 || b.hit) this.bullets.splice(i, 1);
      else b.update(enemies);
    });
    // Check if it is a new day, day is 20 seconds
    this.day = Math.floor(tick / 1200);
    // Check if ship crashed into an enemy
    enemies
      .filter(e => distanceToTarget({ x: this.x, y: this.y }, e) < 55)
      .forEach(hitEnemy => {
        this.health -= 10;
        this.context.canvas.dispatchEvent(new CustomEvent('enemyHit', { detail: hitEnemy }));
      });
    // Show exhaust when forward is clicked, see index for movement
    const prevShowExhaust = this.showExhaust;
    this.showExhaust = keyPressed('w');
    if (this.showExhaust && !prevShowExhaust) engineSoundOn(this.engineLevel);
    else if (!this.showExhaust && prevShowExhaust) engineSoundOff();
    if (keyPressed('space') && tick - this.lastFire >= this.fireRate) {
      fireSound();
      this.lastFire = tick;
      this.fire(tick);
    }
    // Update the ship's speed on key press
    if (keyPressed('w')) {
      this.speedX += -Math.sin(this.rotation) * 0.05;
      this.speedY += Math.cos(this.rotation) * 0.05;
      const speed = distance(this.speedX, this.speedY);
      // Ensure ship does not go over current max speed
      if (speed > this.maxShipSpeed) {
        this.speedX *= this.maxShipSpeed / speed;
        this.speedY *= this.maxShipSpeed / speed;
      }
    }
    // Rotate on key press
    if (keyPressed('a')) {
      this.rotation = this.rotation - 0.05;
    }
    if (keyPressed('d')) {
      this.rotation = this.rotation + 0.05;
    }
  }
  fire(tick) {
    this.bullets.push(
      new Bullet({
        dx: Math.sin(this.rotation) * 10,
        dy: -Math.cos(this.rotation) * 10,
        x: this.x + Math.sin(this.rotation) * 40,
        y: this.y - Math.cos(this.rotation) * 40,
        rotation: this.rotation,
        tick
      })
    );
  }
}
export default Ship;
