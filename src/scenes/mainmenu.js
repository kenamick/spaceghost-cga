// mainmenu.js - game menu
import BaseScene from './base-scene';
import Globals from '../globals';
import Phaser from 'phaser';
import Controls from '../controls';

const Menus = [
    { text: 'PLAY', scene: 'Level1' },
    { text: 'CONTROLS', scene: 'Controls' },
    { text: 'CREDITS', scene: 'Credits' }
];

class MainMenu extends BaseScene {
  
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = Globals.game.config;

    const backg = this.add.tileSprite(0, 0,
      width * 2, height * 2, 'bkg-blue');

      this.addMenu();
    this.addTweenText(50, 10, 'SPACE-O-MAN', 50, (tween) => {
      //this.addMenu();
    });

    this.controls = new Controls(this, true);

    // always last
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);

    const { cursor } = this.menu;

    if (this.controls.up) {
      cursor.pos -= 1;
      if (cursor.pos < 0) {
        cursor.pos = this.menu.options.length - 1;
      }
      this.updateCursor();
    } else if (this.controls.down) {
      cursor.pos += 1;
      if (cursor.pos >= this.menu.options.length) {
        cursor.pos = 0;
      }
      this.updateCursor();
    } else if (this.controls.action1) {
      // select
      this.spinCursor(() => 
        this.scene.start(this.menu.options[cursor.pos].scene));
    }
  }

  addMenu() {
    const sx = 80, sy = 200, offset = 50; // menu position

    this.menu = {
      options: Menus,
      cursor: {}
    };

    const csy = sy + 25;
    this.menu.cursor = {
      pos: 0,
      startY: csy,
      offset: offset,
      background: this.addRect(sx - 30, csy, Globals.game.config.width * 2, 30),
      sprite: this.addMenuSelector(sx - 30, csy, 20)
    };

    for (let i = 0; i < this.menu.options.length; i++) {
      this.menu.options[i].y = sy + offset * i;
      this.addText(sx, this.menu.options[i].y, this.menu.options[i].text);
    }
  }

  addText(x, y, text, size = 24) {
    this.add.bitmapText(x, y, Globals.bitmapFont, text, size);
  }

  addTweenText(x, y, text, size = 24, cb) {
    this.addRect(x, y + size * 1.15, Globals.game.config.width * 2, size * 1.2);
    const bitmap = this.add.bitmapText(x, y, Globals.bitmapFont, text, size);
    bitmap.alpha = 0;
    this.tweens.add({
      targets: [bitmap],
      alpha: 1,
      duration: 1500,
      ease: 'Easing.Bounce.Out',
      onComplete: cb
    });
  }

  addRect(x, y, w, h) {
    const rect = this.add.graphics().setVisible(false);
    rect.fillStyle(0x090909);
    rect.fillRect(0, 0, w, h);
    const name = 'r' + w + h;
    rect.generateTexture(name, w, h);
    const img = this.add.image(x, y, name);
    img.alpha = 0.4;
    return img;
  }

  addMenuSelector(x, y, size) {
    const tri = this.add.graphics({ fillStyle: { color: 0xffffff } }).setVisible(false);
    tri.fillTriangleShape(new Phaser.Geom.Triangle(0, 0, 0, size, size, size * 0.5));
    tri.generateTexture('cursor', size, size);
    return this.add.image(x, y, 'cursor').setOrigin(0.5);
  }

  updateCursor() {
    const { cursor } = this.menu;
    const toY = cursor.startY + cursor.pos * cursor.offset;
    this.tweens.add({
      targets: [cursor.sprite, cursor.background],
      y: toY,
      duration: 150,
      ease: 'Easing.Bounce.In'
    });
  }

  spinCursor(cb) {
    const { cursor } = this.menu;
    cursor.sprite.setOrigin(0.5);
    this.tweens.add({
      targets: cursor.sprite,
      rotation: 2 * Math.PI + Math.PI / 2,
      duration: 1500,
      ease: 'Power1',
      onComplete: cb
    });
  }

}

export { MainMenu };
