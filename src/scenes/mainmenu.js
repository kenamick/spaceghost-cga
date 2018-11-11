// mainmenu.js - game menu
import BaseScene from './base-scene';
import Globals from '../globals';
import Phaser from 'phaser';

class MainMenu extends BaseScene {
  
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = Globals.game.config;

    const backg = this.add.tileSprite(0, 0,
      width * 2, height * 2, 'bkg-blue');

    this.addTweenText(50, 10, 'SPACE-O-MAN', 50);

    // always last
    super.create();
  }

  addTweenText(x, y, text, size = 24) {
    this.addRect(x, y + size * 1.1, Globals.game.config.width * 2, size * 1.4);
    const bitmap = this.add.bitmapText(x, y, Globals.bitmapFont, text, size);
    bitmap.alpha = 0;
    this.tweens.add({
      targets: [bitmap],
      alpha: 1,
      duration: 1500,
      ease: 'Easing.Bounce.Out',
    });
  }

  addRect(x, y, w, h) {
    const rect = this.add.graphics().setVisible(false);
    rect.fillStyle(0x090909);
    rect.fillRect(0, 0, w, h);
    rect.generateTexture('rect1', w, h);
    const img = this.add.image(x, y, 'rect1');
    img.alpha = 0.4;
    return img;
  }

}

export { MainMenu };
