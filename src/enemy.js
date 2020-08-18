import { Sprite } from 'kontra';
import { distanceToTarget, angleToTarget, magnitude, range, seedRand } from './misc';
import { enemyPatterns } from './textures';
const accSpeed = 0.1;
class Enemy extends Sprite.class {
  constructor(properties) {
    properties = { ...properties, width: 40, height: 40, speedX: 0, speedY: 0, anchor: { x: 0.5, y: 0.5 } };
    super(properties);
    this.type = Math.floor((Math.random() * enemyPatterns.length) / 3) * 3;
    this.colorList = enemyPatterns;
    this.health++;
    this.minusHealth();
  }
  // draw() {
  //   const { context } = this;
  //   context.fillStyle = this.color;
  //   for (let i = 0; i < this.width / 2; i++) context.fillRect(i, i / 2, this.width, this.height);
  // }
  minusHealth() {
    this.health--;
    if (this.health > 0) this.color = this.colorList[this.health - 1 + this.type];
  }
  update(enemies, planets) {
    const _this = this;
    /**
     * Find the closest other enemy
     */
    const planetXY = { x: planets.planetX + planets.x, y: planets.planetY + planets.y, radius: planets.radius };
    let planetAvoidance;
    if (planetXY.radius > 0) {
      const dist = distanceToTarget(_this, planetXY) - planetXY.radius;
      const angle = angleToTarget(_this, planetXY) + 110;
      planetAvoidance = {
        angle,
        dist
      };
    }
    const avoidEnemies = enemies.reduce(
      (a, e) => {
        if (e !== _this) {
          const dist = distanceToTarget(_this, e);
          if (dist < a.dist) {
            const angle = angleToTarget(_this, e) + 180;
            return {
              angle,
              dist
            };
          }
        }
        return a;
      },
      { dist: 100, angle: 0 }
    );
    /**
     * Find the path to the players ship
     */
    let angle = angleToTarget(_this, _this.ship);
    if (planetAvoidance && planetAvoidance.dist < 100) angle = (planetAvoidance.angle + angle) / 2;
    else if (avoidEnemies.dist < 100) angle = (avoidEnemies.angle + angle) / 2;
    _this.speedX -= Math.sin(angle) * accSpeed;
    _this.speedY += Math.cos(angle) * accSpeed;
    const speed = magnitude(_this.speedX, _this.speedY);
    /**
     * Max Speed starts at 5, works up to 10 over 40 days
     */
    const day = _this.ship.day;
    const maxSpeed = Math.min(day / 8, 5) + 5;
    if (speed > maxSpeed) {
      _this.speedX *= maxSpeed / speed;
      _this.speedY *= maxSpeed / speed;
    }

    _this.dx -= _this.speedX;
    _this.dy -= _this.speedY;
    super.update();
  }
}
export default Enemy;
