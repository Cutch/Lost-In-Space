import { GameObject, Text, Sprite } from 'kontra';
import { engineSoundOff } from './sound';
import { getStory, playAgain } from './story';
const pad = 20;
const fontSize = 36;
const font = `${fontSize}px Arial`;
const smallFont = `20px Arial`;
const color = '#fff';
const textAlign = 'center';
const localStorage = window.localStorage;
let maxScrap = localStorage ? localStorage.getItem('lins25_score') || 0 : 0;
let level = localStorage ? localStorage.getItem('lins25_level') || 0 : 0;
export const getLevel = () => level;
class GameOver extends GameObject.class {
  gameWin = false;
  constructor(ship, gameWin) {
    super();
    engineSoundOff();
    const _this = this;
    const chapter = getStory();
    _this.background = new Sprite({ width: 650, height: 400, color: '#600A' });
    _this.winTexts = chapter.gameOverText.map(gg => new Text({ font: smallFont, color, text: gg, textAlign }));
    _this.gameOverText = new Text({ font, color, text: 'Game Over', textAlign });
    _this.highScoreText = new Text({ font, color, text: `Score: ${ship.scrap}`, textAlign });
    const maxScore = Math.max(maxScrap, ship.scrap);

    maxScrap = maxScore; // In case there is no local storage write it for this session
    if (gameWin) level++; // In case there is no local storage write it for this session

    if (localStorage) {
      localStorage.setItem('lins25_score', maxScore);
      localStorage.setItem('lins25_level', level);
    }
    _this.maxScoreText = new Text({
      font: `18px Arial`,
      color,
      text: `High Score: ${maxScore} scrap`,
      textAlign
    });

    _this.playAgainText = new Text({ font, color, text: gameWin ? chapter.playAgain : playAgain, textAlign });
    _this.gameWin = gameWin;
    _this.update();
  }

  render() {
    const _this = this;
    _this.background.render();
    _this.context.beginPath();
    _this.context.strokeStyle = '#fff';
    this.context.rect(_this.background.x, _this.background.y, _this.background.width, _this.background.height);
    _this.context.strokeWidth = 5;
    _this.context.stroke();
    // _this.context.strokeStyle = '#fff0';
    if (_this.gameWin) {
      _this.winTexts.forEach(w => w.render());
    } else _this.gameOverText.render();

    _this.highScoreText.render();
    if (_this.maxScoreText) _this.maxScoreText.render();
    _this.playAgainText.render();
  }
  update() {
    const _this = this;
    const cw = _this.context.canvas.width / 2;
    const ch = _this.context.canvas.height / 2;
    _this.background.x = cw - _this.background.width / 2;
    _this.background.y = ch - _this.background.height / 2;
    const shift = _this.gameWin ? 0 : 48;
    if (_this.gameWin) {
      _this.winTexts.forEach((w, i) => {
        w.x = cw;
        w.y = ch - (20 + pad) * (_this.winTexts.length - i) - 20;
      });
    } else {
      _this.gameOverText.x = cw;
      _this.gameOverText.y = ch - (fontSize + pad) - shift;
    }
    _this.highScoreText.x = cw;
    _this.highScoreText.y = ch - shift;
    if (_this.maxScoreText) {
      _this.maxScoreText.x = cw;
      _this.maxScoreText.y = ch + (fontSize + pad) - shift;
    }
    _this.playAgainText.x = cw;
    _this.playAgainText.y = ch + (fontSize + pad) * 2 - shift;
  }
}
export default GameOver;
