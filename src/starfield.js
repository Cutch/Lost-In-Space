import { GameObject } from 'kontra';
class StarField extends GameObject.class {
  constructor(properties) {
    super(properties);
  }

  draw() {
    this.context.fillStyle = '#000';
    this.context.fillRect(-this.x, -this.y, this.context.canvas.width, this.context.canvas.height);
    this.context.fillStyle = '#fff';
    for (let i = 0; i < this.context.canvas.width * this.context.canvas.height * 0.0001; i++) {
      this.context.fillRect(
        -this.x + ((this.x + (Math.pow(i, 3) * 2 + i * 20)) % this.context.canvas.width),
        -this.y + ((this.y + (Math.pow(i, 3) * 2 + i * 20)) % this.context.canvas.height),
        (i % 3) + 1,
        (i % 3) + 1
      );
    }
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
