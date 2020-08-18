import { GameObject, Text, Sprite } from 'kontra';
import { engineSoundOff } from './sound';
const pad = 20;
const fontSize = 36;
const font = `${fontSize}px Arial`;
const smallFont = `20px Arial`;
const color = '#fff';
const textAlign = 'center';
const addS = n => (n !== 1 ? 's' : '');
const localStorage = window.localStorage;

class GameOver extends GameObject.class {
  gameWin = false;
  constructor(ship, gameWin) {
    super();
    engineSoundOff();
    const _this = this;
    _this.background = new Sprite({ width: 650, height: 400, color: '#600A' });
    _this.winText = new Text({ font: smallFont, color, text: "Me: These are the coordinates, where's Earth?", textAlign });
    _this.winText2 = new Text({ font: smallFont, color, text: 'Computer: Error: 404. Earth not found.', textAlign });
    _this.winText3 = new Text({
      font: smallFont,
      color,
      text: 'Me: Okay... Well I might as well see how many Corg I can destroy',
      textAlign
    });
    _this.gameOverText = new Text({ font, color, text: 'Game Over', textAlign });
    _this.highScoreText = new Text({ font, color, text: `Score: ${ship.scrap}`, textAlign });
    let hasWon = false;
    if (localStorage) {
      const maxScore = Math.max(localStorage.getItem('lins_score') || 0, ship.scrap);
      hasWon = localStorage.getItem('lins_won') || false;
      localStorage.setItem('lins_score', maxScore);
      localStorage.setItem('lins_won', hasWon || gameWin);
      _this.maxScoreText = new Text({
        font: `18px Arial`,
        color,
        text: `High Score: ${maxScore} scrap`,
        textAlign
      });
    }
    _this.dayText = new Text({
      font,
      color,
      text: `${!hasWon && gameWin ? 'Completed in' : 'Lasted'}: ${ship.day} day${addS(ship.day)}`,
      textAlign
    });
    _this.playAgainText = new Text({ font, color, text: 'Endless Destruction? Press Enter', textAlign });
    _this.gameWin = gameWin;
  }

  render() {
    const _this = this;
    _this.background.render();
    if (_this.gameWin) {
      _this.winText.render();
      _this.winText2.render();
      this.winText3.render();
    } else _this.gameOverText.render();

    _this.highScoreText.render();
    _this.dayText.render();
    if (_this.maxScoreText) _this.maxScoreText.render();
    _this.playAgainText.render();
  }
  update() {
    const _this = this;
    const cw = _this.context.canvas.width / 2;
    const ch = _this.context.canvas.height / 2;
    _this.background.x = cw - _this.background.width / 2;
    _this.background.y = ch - _this.background.height / 2;
    _this.winText.x = cw;
    _this.winText.y = ch - (20 + pad) * 4;
    _this.winText2.x = cw;
    _this.winText2.y = ch - (24 + pad) * 3;
    _this.winText3.x = cw;
    _this.winText3.y = ch - (32 + pad) * 2;
    _this.gameOverText.x = cw;
    _this.gameOverText.y = ch - (fontSize + pad) * 2;
    _this.highScoreText.x = cw;
    _this.highScoreText.y = ch - (fontSize + pad);
    _this.dayText.x = cw;
    _this.dayText.y = ch;
    if (_this.maxScoreText) {
      _this.maxScoreText.x = cw;
      _this.maxScoreText.y = ch + (fontSize + pad);
    }
    _this.playAgainText.x = cw;
    _this.playAgainText.y = ch + (fontSize + pad) * 2;
  }
}
export default GameOver;
