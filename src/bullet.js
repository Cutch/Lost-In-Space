import { Sprite } from 'kontra';
import { pointInRect } from './misc';
class Bullet extends Sprite.class {
  constructor(properties) {
    properties = { ...properties, width: 2, height: 10, color: '#abab46', hit: false };
    super(properties);
  }
  update(enemies) {
    super.update();
    /**
     * Check if the bullet has hit any enemies
     */
    enemies
      .filter(e => pointInRect(this, e))
      .forEach(hitEnemy => {
        this.hit = true;
        hitEnemy.health--;
        if (hitEnemy.health <= 0) this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: hitEnemy }));
      });
  }
}
export default Bullet;
