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
    const _this = this;
    _this.dayText = new Text(fontProps);
    _this.scrapText = new Text(fontProps);
    _this.healthText = new Text(fontProps);
    _this.skipHelper = new Text({ font: `12px Arial`, color, text: 'Press SPACE to skip' });
    _this.statusTextBackground = new Sprite({ color: '#6009' });
  }
  setSkipHelper(on) {
    this.showSkipHelper = on;
  }

  render() {
    const _this = this;
    _this.dayText.render();
    _this.scrapText.render();
    _this.healthText.render();
    if (_this.statusText) {
      _this.statusTextBackground.render();
      _this.statusText.render();
      if (_this.showSkipHelper) _this.skipHelper.render();
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
    const _this = this;
    const w = _this.context.canvas.width;
    const h = _this.context.canvas.height;
    _this.dayText.x = w - pad;
    _this.dayText.y = h - pad - fontSize;
    _this.scrapText.x = w - pad;
    _this.scrapText.y = h - 45 - pad - fontSize;
    _this.healthText.x = w - pad;
    _this.healthText.y = h - 90 - pad - fontSize;
    _this.scrapText.text = `Scrap: ${ship.scrap}t`;
    _this.dayText.text = `Day: ${ship.day}`;
    _this.healthText.text = `Hull Integrity: ${ship.health}%`;
    if (_this.statusText) {
      _this.statusTextBackground.width = w;
      _this.statusTextBackground.height = fontSize + pad * 2;
      _this.statusText.x = w / 2;
      _this.statusText.y = pad;
      if (_this.showSkipHelper) {
        _this.skipHelper.x = w / 2 + 150;
        _this.skipHelper.y = pad * 2 + 7;
      }
    }
  }
}
export default Cockpit;
