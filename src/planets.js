import { GameObject } from 'kontra';
import { seedRand, distanceToTarget, angleToTarget } from './misc';
import { planetPatterns } from './textures';
class Planets extends GameObject.class {
  constructor(props) {
    super(props);
  }

  draw() {
    const { context } = this;
    context.fillStyle = planetPatterns[Math.pow(this.quadX * 10 + this.quadY, 2) % planetPatterns.length];
    context.beginPath();
    context.arc(this.planetX, this.planetY, this.radius, 0, 2 * Math.PI);
    context.fill();
    /**
     * Testing code, adds quadrant lines
     */
    // const { width, height } = this.context.canvas;
    // const x = (this.x || 0) - width / 2;
    // const y = (this.y || 0) - height / 2;
    // const quadWidth = width * 2; // Minimum * 2 so that it appears off screen
    // const quadHeight = height * 2;
    // const quadX = Math.floor(x / quadWidth) + 1;
    // const quadY = Math.floor(y / quadHeight) + 1;

    // context.strokeStyle = '#F00';
    // context.lineWidth = 5;
    // context.beginPath();
    // context.moveTo(Math.abs(quadX - 1) * quadWidth, -100000);
    // context.lineTo(Math.abs(quadX - 1) * quadWidth, 100000);
    // context.stroke();
    // context.strokeStyle = '#0F0';
    // context.beginPath();
    // context.moveTo(Math.abs(quadX) * quadWidth, -100000);
    // context.lineTo(Math.abs(quadX) * quadWidth, 100000);
    // context.stroke();

    // context.strokeStyle = '#F00';
    // context.beginPath();
    // context.moveTo(-100000, Math.abs(quadY - 1) * quadHeight);
    // context.lineTo(100000, Math.abs(quadY - 1) * quadHeight);
    // context.stroke();
    // context.strokeStyle = '#0F0';
    // context.beginPath();
    // context.moveTo(-100000, Math.abs(quadY) * quadHeight);
    // context.lineTo(100000, Math.abs(quadY) * quadHeight);
    // context.stroke();

    // const minQuadX = Math.floor((0 * quadWidth) / 2 + quadWidth / 4 - quadX * quadWidth);
    // const maxQuadX = Math.floor((1 * quadWidth) / 2 + quadWidth / 4 - quadX * quadWidth);
    // const minQuadY = Math.floor((0 * quadHeight) / 2 + quadHeight / 4 - quadY * quadHeight);
    // const maxQuadY = Math.floor((1 * quadHeight) / 2 + quadHeight / 4 - quadY * quadHeight);
    // context.strokeStyle = '#00F';
    // context.beginPath();
    // context.moveTo(minQuadX, -100000);
    // context.lineTo(minQuadX, 100000);
    // context.stroke();

    // context.beginPath();
    // context.moveTo(maxQuadX, -100000);
    // context.lineTo(maxQuadX, 100000);
    // context.stroke();

    // context.beginPath();
    // context.moveTo(-100000, minQuadY);
    // context.lineTo(100000, minQuadY);
    // context.stroke();

    // context.beginPath();
    // context.moveTo(-100000, maxQuadY);
    // context.lineTo(100000, maxQuadY);
    // context.stroke();
  }
  update(enemies, ship, tick) {
    super.update();
    const { width, height } = this.context.canvas;
    const x = (this.x || 0) - width / 2;
    const y = (this.y || 0) - height / 2;
    /**
     * Create quadrants based on screen width
     */
    const quadWidth = width * 2; // Minimum * 2 so that it appears off screen
    const quadHeight = height * 2;
    const quadX = Math.floor(x / quadWidth) + 1;
    const quadY = Math.floor(y / quadHeight) + 1;
    const lastSeed = quadX * 10000 + quadY;
    this.quadX = quadX;
    this.quadY = quadY;
    let justAppeared = false;
    if (quadX === 0 && quadY === 0) {
      // No planet in the first quadrant
      this.radius = 0;
      // this.planetX = 200;
      // this.planetY = ship.y - this.y;
      // this.radius = 1 * 60 + 40;
    } else {
      /**
       * Randomly place a planet in the center of a quadrant outside of the screen
       */
      justAppeared = lastSeed != quadX * 10000 + quadY;
      const rand = seedRand(quadX * 10000 + quadY);
      this.radius = Math.floor(rand() * 60 + 40); // Range 40-100
      // Using radius * 4 as planet is 0,0 of planet is top left corner
      this.planetX = Math.floor((rand() * (quadWidth - this.radius * 4)) / 2 + quadWidth / 4 - quadX * quadWidth + this.radius);
      this.planetY = Math.floor((rand() * (quadHeight - this.radius * 4)) / 2 + quadHeight / 4 - quadY * quadHeight + this.radius);
    }
    if (this.radius > 0) {
      [...enemies, ship].forEach(ship => {
        const planetXY = { x: this.planetX, y: this.planetY };
        const shipXY = { x: ship.x - this.x, y: ship.y - this.y };
        const dist = distanceToTarget(shipXY, planetXY);

        if (dist <= this.radius + 30) {
          /**
           * Check for simple radius based collisions
           */
          const collision = { x: (shipXY.x - planetXY.x) / dist, y: (shipXY.y - planetXY.y) / dist };
          const velocity = { x: -ship.speedX, y: ship.speedY };
          const speed = -velocity.x * collision.x + velocity.y * collision.y;
          if (speed > 0) {
            ship.speedX = -speed * collision.x * 0.8;
            ship.speedY = -speed * collision.y * 0.8;
          }
          if (justAppeared) {
            // Kill enemies that get caught in the spawn location
            ship.kill();
          }
        } else if (dist < this.radius * 6) {
          /**
           * If in sphere of influence apply gravity
           */
          const angle = angleToTarget(shipXY, planetXY);
          ship.speedX += ((-Math.sin(angle) / 50) * dist) / 150;
          ship.speedY += ((Math.cos(angle) / 50) * dist) / 150;
        }
      });
    }
  }
}
export default Planets;
