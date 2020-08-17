import { GameObject } from 'kontra';
import { range } from './misc';
class StarField extends GameObject.class {
  constructor(properties) {
    super(properties);
  }

  draw() {
    const ctx = this.context;
    ctx.fillStyle = '#000';
    ctx.fillRect(-this.x, -this.y, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    range(Math.floor(ctx.canvas.width * ctx.canvas.height * 0.0001)).forEach(i =>
      ctx.fillRect(
        -this.x + ((this.x + (Math.pow(i, 3) * 2 + i * 20)) % ctx.canvas.width),
        -this.y + ((this.y + (Math.pow(i, 3) * 2 + i * 20)) % ctx.canvas.height),
        (i % 3) + 1,
        (i % 3) + 1
      )
    );
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
