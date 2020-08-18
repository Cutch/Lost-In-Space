import { Sprite } from 'kontra';
import { pointInRect, distanceToTarget } from './misc';
class Bullet extends Sprite.class {
  constructor(properties) {
    properties = { ...properties, width: 2, height: 10, color: '#abab46', hit: false };
    super(properties);
  }
  update(enemies, planets) {
    super.update();
    /**
     * Check if the bullet has hit any enemies
     */
    enemies
      .filter(e => pointInRect(this, e))
      .forEach(hitEnemy => {
        this.hit = true;
        hitEnemy.minusHealth();
        if (hitEnemy.health <= 0) this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: hitEnemy }));
      });
    /**
     * Check for bullet planet collision
     */
    if (distanceToTarget({ x: planets.planetX + planets.x, y: planets.planetY + planets.y }, this) <= planets.radius) this.hit = true;
  }
}
export default Bullet;
