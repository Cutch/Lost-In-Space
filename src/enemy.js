import { Sprite } from 'kontra';
import { distanceToTarget, angleToTarget, distance, range, seedRand } from './misc';
const accSpeed = 0.1;
const getPattern = (color, seed) => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 40;
  patternCanvas.height = 40;

  // Give the pattern a background color
  patternContext.fillStyle = color;
  patternContext.fillRect(0, 0, 40, 40);

  const rand = seedRand(seed + 1);
  for (let x = 0, y = 0; y < 40; ) {
    const w = Math.floor(rand() * 7 + 2);
    patternContext.fillStyle = rand() < 0.5 ? '#333' : '#222';
    patternContext.fillRect(x, y, w, Math.floor(rand() * 7 + 2));
    x += 1 + w;
    if (x > 40) {
      y += 5;
      x = 0;
    }
  }
  return patternCanvas;
};
const typeCount = 15;
const colors = range(typeCount).reduce((t, x) => [...t, ...['#080', '#008', '#800'].map(color => getPattern(color, x))], []);
class Enemy extends Sprite.class {
  constructor(properties) {
    properties = { ...properties, width: 40, height: 40, speedX: 0, speedY: 0, anchor: { x: 0.5, y: 0.5 } };
    super(properties);
    this.type = Math.floor(Math.random() * typeCount) * 3;
    this.colorList = colors.map(x => this.context.createPattern(x, null));
    this.health++;
    this.minusHealth();
  }
  minusHealth() {
    this.health--;
    if (this.health > 0) this.color = this.colorList[this.health - 1 + this.type];
  }
  update(enemies) {
    const _this = this;
    /**
     * Find the closest other enemy
     */
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
    if (avoidEnemies.dist !== 100) angle = avoidEnemies.angle + angle / 2;
    _this.speedX -= Math.sin(angle) * accSpeed;
    _this.speedY += Math.cos(angle) * accSpeed;
    const speed = distance(_this.speedX, _this.speedY);
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
