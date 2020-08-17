import { GameObject, Sprite, angleToTarget } from 'kontra';
import { range, randomPointOutsideView } from './misc';
class StarField extends GameObject.class {
  shootingStars = [];
  constructor(properties) {
    super(properties);
  }

  draw() {
    const { context } = this;
    /**
     * Draw the star field
     */
    context.fillStyle = '#000';
    context.fillRect(-this.x, -this.y, context.canvas.width, context.canvas.height);
    context.fillStyle = '#fff';
    range(Math.floor(context.canvas.width * context.canvas.height * 0.0001)).forEach(i =>
      context.fillRect(
        -this.x + ((this.x + (Math.pow(i, 3) * 2 + i * 20)) % context.canvas.width),
        -this.y + ((this.y + (Math.pow(i, 3) * 2 + i * 20)) % context.canvas.height),
        (i % 3) + 1,
        (i % 3) + 1
      )
    );
  }
  update(tick) {
    super.update();
    this.shootingStars.forEach((s, i) => {
      s.update();
      if (tick - s.tick > 300) this.shootingStars.splice(i, 1);
    });
    /**
     * Shooting star spawn
     */
    if (tick % 300 == 0) {
      const [x, y] = randomPointOutsideView(this.context.canvas);
      this.shootingStars.push(
        new Sprite({
          color: '#fff',
          x,
          y,
          width: 2,
          height: 4,
          tick,
          dx: -Math.sign(x) * 7,
          dy: -Math.sign(y) * 7,
          rotation: angleToTarget({ x, y }, { x: -x, y: -y })
        })
      );
    }
  }
  render() {
    super.render();
    this.shootingStars.forEach(s => s.render());
  }
}
export default StarField;
/* Twinkle

    for(let i = 0; i < 150; i++){
      this.context.fillRect(
        -this.x+(Math.abs((Math.pow(this.x+i, 3)*2+(this.y+i)*20))%this.context.canvas.width),
        -this.y+(Math.abs((Math.pow(this.y+i, 3)*2+(this.x+i)*20))%this.context.canvas.height), 2, 2)
    }
*/
