import { GameObject, Text, Sprite } from 'kontra';
const pad = 20;
const fontSize = 24;
const font = `${fontSize}px Arial`;
const color = '#fff';
const textAlign = 'right';
const fontProps = {
  font,
  color,
  textAlign
};
class Cockpit extends GameObject.class {
  queue = [];
  showTitleText = true;
  showSkipHelper = false;
  constructor(props) {
    super(props);
    this.dayText = new Text(fontProps);
    this.scrapText = new Text(fontProps);
    this.healthText = new Text(fontProps);
    this.skipHelper = new Text({ font: `12px Arial`, color, text: 'Press SPACE to skip' });
    this.statusTextBackground = new Sprite({ color: '#6009' });
  }
  setSkipHelper(on) {
    this.showSkipHelper = on;
  }

  render() {
    this.dayText.render();
    this.scrapText.render();
    this.healthText.render();
    if (this.statusText) {
      this.statusTextBackground.render();
      this.statusText.render();
      if (this.showSkipHelper) this.skipHelper.render();
    }
  }
  addStatus(text, time = 6000) {
    this.queue.push([text, time]);
    if (!this.statusText) this.getNextStatus();
  }
  getNextStatus() {
    clearTimeout(this.timer);
    if (this.queue.length > 0) {
      const [text, time] = this.queue.shift();
      this.statusText = new Text({
        font,
        color,
        text,
        textAlign: 'center',
        x: this.context.canvas.width / 2,
        y: pad
      });
      this.timer = setTimeout(() => this.getNextStatus(), time);
    } else this.statusText = null;
  }
  update(ship) {
    const w = this.context.canvas.width;
    const h = this.context.canvas.height;
    this.dayText.x = w - pad;
    this.dayText.y = h - pad - fontSize;
    this.scrapText.x = w - pad;
    this.scrapText.y = h - 45 - pad - fontSize;
    this.healthText.x = w - pad;
    this.healthText.y = h - 90 - pad - fontSize;
    this.scrapText.text = `Scrap: ${ship.scrap}t`;
    this.dayText.text = `Day: ${ship.day}`;
    this.healthText.text = `Hull Integrity: ${ship.health}%`;
    if (this.statusText) {
      this.statusTextBackground.width = w;
      this.statusTextBackground.height = fontSize + pad * 2;
      this.statusText.x = w / 2;
      this.statusText.y = pad;
      if (this.showSkipHelper) {
        this.skipHelper.x = w / 2 + 150;
        this.skipHelper.y = pad * 2 + 7;
      }
    }
  }
}
export default Cockpit;
