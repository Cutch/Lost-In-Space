import { Sprite } from 'kontra';
import { distanceToTarget, angleToTarget, distance } from './misc';
const accSpeed = 0.1;
class Enemy extends Sprite.class {
  constructor(properties) {
    properties = { ...properties, width: 40, height: 40, color: 'green', speedX: 0, speedY: 0, anchor: { x: 0.5, y: 0.5 } };
    super(properties);
  }
  update(enemies) {
    /**
     * Find the closest other enemy
     */
    const avoidEnemies = enemies.reduce(
      (a, e) => {
        if (e !== this) {
          const dist = distanceToTarget(this, e);
          if (dist < a.dist) {
            const angle = angleToTarget(this, e) + 180;
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
    let angle = angleToTarget(this, this.ship);
    if (avoidEnemies.dist !== 100) angle = avoidEnemies.angle + angle / 2;
    this.speedX -= Math.sin(angle) * accSpeed;
    this.speedY += Math.cos(angle) * accSpeed;
    const speed = distance(this.speedX, this.speedY);
    /**
     * Max Speed starts at 5, works up to 15 over 20 days
     */
    const day = this.ship.day;
    const maxSpeed = Math.min(day / 2, 10) + 5;
    if (speed > maxSpeed) {
      this.speedX *= maxSpeed / speed;
      this.speedY *= maxSpeed / speed;
    }

    this.dx -= this.speedX;
    this.dy -= this.speedY;
    super.update();
  }
}
export default Enemy;
