// mainmenu.js - game menu
import BaseScene from './base-scene';
import Globals from '../globals';
import Audio from '../audio';
import Phaser from 'phaser';
import Controls from '../controls';
import { Pacman, PacmanStates } from '../entities/enemies';

const Menus = [
  { text: 'PLAY', scene: 'Level1' },
  { text: 'HOW TO PLAY', scene: 'Howtoplay' },
  { text: 'HISCORES', scene: 'Hiscores' },
  { text: 'CREDITS', scene: 'Credits' }
];

class MainMenu extends BaseScene {

  constructor() {
    super('MainMenu');
  }

  create() {
    super.enableShaders();
    
    const { width, height } = Globals.game.config;

    const backg = this.add.tileSprite(0, 0,
      width * 2, height * 2, 'bkg-blue');

    this.addPacman();
    this.addMenu();
    this.addTitle(50, 10, 'P A C T E R O I D S', 50, (tween) => {
      this.controls = new Controls(this, true);
    });

    // sfx
    this.audio = new Audio(this);
    this.audio.setMusicVol('music-menu', 0);
    this.audio.playMusic('music-menu', { loop: true });
    this.audio.fadeIn(null, { maxVol: 0.9 });

    // always last
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);

    if (this.menu && this.controls) {
      const { cursor } = this.menu;

      if (!cursor.spinning) {
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
          this.spinCursor(() => {
            this.scene.start(this.menu.options[cursor.pos].scene)
          });
        }
      }
    }

    if (this.pacman) {
      this.pacman.update(time, delta);
      if (this.pacman.gameSprite.x < Globals.game.config.width * 0.5) {
        // enable wrap once past mid-screen
        this.pacman.setConfig('noWrap', false);
      }
    }
  }

  addPacman() {
    const size = Globals.game.config.height * 0.75;
    this.pacman = new Pacman(this, {
      x: Globals.game.config.width + 50, //+ size * 0.9,
      y: Globals.game.config.height * 0.5,
      size,
      animSpeed: 1300,
      facing: 'left',
      color: 0xb1b1b1,
      noWrap: true
    });
    this.pacman.setState(PacmanStates.moveLeft, {speed: -150});
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
      background: this.addRect(sx - 30, csy + 1, Globals.game.config.width * 2, 31),
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

  addTitle(x, y, text, size = 24, cb) {
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

    // play sfx
    this.audio.playSound('menu-select');
  }

  spinCursor(cb) {
    const { cursor } = this.menu;
    cursor.spinning = true;
    this.tweens.add({
      targets: cursor.sprite,
      rotation: 2 * Math.PI + Math.PI / 2,
      duration: 1500,
      ease: 'Power1',
      onComplete: this.audio.fadeOut(cb)
    });

    // play sfx
    this.audio.playSound('menu-tap');
  }

}

export { MainMenu };
