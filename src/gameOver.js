import { GameObject, Text, Sprite } from 'kontra';
import { engineSoundOff } from './sound';
const pad = 20;
const fontSize = 36;
const font = `${fontSize}px Arial`;
const smallFont = `24px Arial`;
const color = '#fff';
const textAlign = 'center';
const addS = n => (n !== 1 ? 's' : '');
class GameOver extends GameObject.class {
  gameWin = false;
  constructor(ship, gameWin) {
    super();
    engineSoundOff();
    this.background = new Sprite({ width: 600, height: 400, color: '#600A' });
    this.winText = new Text({ font: smallFont, color, text: "Me: These are the coordinates, where's Earth?", textAlign });
    this.winText2 = new Text({ font: smallFont, color, text: 'Computer: Error: 404. Earth not found.', textAlign });
    this.gameOverText = new Text({ font, color, text: 'Game Over', textAlign });
    this.highScoreText = new Text({ font, color, text: `Score: ${ship.scrap}`, textAlign });
    if (window.localStorage) {
      const maxScore = Math.max(localStorage.getItem('lins_score') || 0, ship.scrap);
      const maxDay = Math.max(localStorage.getItem('lins_day') || 0, ship.day);
      localStorage.setItem('lins_score', maxScore);
      localStorage.setItem('lins_day', maxDay);
      this.maxScoreText = new Text({
        font: `18px Arial`,
        color,
        text: `High Score: ${maxDay} day${addS(maxDay)}, ${maxScore} scrap`,
        textAlign
      });
    }
    this.dayText = new Text({
      font,
      color,
      text: `${gameWin ? 'Completed in' : 'Lasted'}: ${ship.day} day${addS(ship.day)}`,
      textAlign
    });
    this.playAgainText = new Text({ font, color, text: 'Play Again? Press Enter', textAlign });
    this.gameWin = gameWin;
  }

  render() {
    this.background.render();
    if (this.gameWin) {
      this.winText.render();
      this.winText2.render();
    } else this.gameOverText.render();

    this.highScoreText.render();
    this.dayText.render();
    if (this.maxScoreText) this.maxScoreText.render();
    this.playAgainText.render();
  }
  update() {
    const cw = this.context.canvas.width / 2;
    const ch = this.context.canvas.height / 2;
    this.background.x = cw - this.background.width / 2;
    this.background.y = ch - this.background.height / 2;
    this.winText.x = cw;
    this.winText.y = ch - (24 + pad) * 3;
    this.winText2.x = cw;
    this.winText2.y = ch - (32 + pad) * 2;
    this.gameOverText.x = cw;
    this.gameOverText.y = ch - (fontSize + pad) * 2;
    this.highScoreText.x = cw;
    this.highScoreText.y = ch - (fontSize + pad);
    this.dayText.x = cw;
    this.dayText.y = ch;
    if (this.maxScoreText) {
      this.maxScoreText.x = cw;
      this.maxScoreText.y = ch + (fontSize + pad);
    }
    this.playAgainText.x = cw;
    this.playAgainText.y = ch + (fontSize + pad) * 2;
  }
}
export default GameOver;
