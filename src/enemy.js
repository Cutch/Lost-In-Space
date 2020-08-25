import { Sprite } from 'kontra';
import { distanceToTarget, angleToTarget, magnitude } from './misc';
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
    this.setToMaxSpeed();
  }
  minusHealth() {
    this.health--;
    if (this.health > 0) this.color = this.colorList[this.health - 1 + this.type];
    else this.kill();
  }
  kill() {
    this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: this }));
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
    const maxSpeed = _this.getMaxSpeed();
    if (speed > maxSpeed) {
      _this.speedX *= maxSpeed / speed;
      _this.speedY *= maxSpeed / speed;
    }

    _this.dx -= _this.speedX;
    _this.dy -= _this.speedY;
    super.update();
  }
  getMaxSpeed() {
    /**
     * Max Speed starts at 5, works up to 10 over 40 days
     */
    return Math.min(this.ship.day / 8, 5) + 5;
  }
  /**
   * Initialize the enemy with the max speed of the ship
   */
  setToMaxSpeed() {
    const _this = this;
    const angle = angleToTarget(_this, _this.ship);
    const maxSpeed = _this.getMaxSpeed();
    _this.speedX -= Math.sin(angle) * maxSpeed;
    _this.speedY += Math.cos(angle) * maxSpeed;
  }
  distanceToShip() {
    return distanceToTarget(this, this.ship);
  }
}
export default Enemy;
