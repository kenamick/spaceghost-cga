// mainmenu.js - game menu
import BaseScene from './base-scene';
import Globals from '../globals';
import * as KPPL from '../shaders/pipeline';
import Audio from '../audio';
import Phaser from 'phaser';
import Controls from '../controls';
import { Pacman, PacmanStates } from '../entities/enemies';

class HowToPlay extends BaseScene {

  constructor() {
    super('HowToPlay');
  }

  create() {
    KPPL.setPipeline('noise');
    super.enableShaders();

    const { width, height } = Globals.game.config;
    const cx = width * 0.5;
    const cy = height * 0.5;

    // background
    const backg = this.add.tileSprite(0, 0, width * 2, height * 2, 'bkg-blue');
    backg.setDepth(0);

    this.addTitle(50, 10, 'H O W   T O   P L A Y', 46, () => {
      this.controls = new Controls(this, true);

      let xpos = 50, ypos = 200, offset = 30, fontSize = 18;

      // TODO
      this.addText(xpos, ypos, 'Use the  arrow keys  or  WAsD  to move.', fontSize);
      ypos += offset * 2;
      this.addText(xpos, ypos, 
        'Press  X  or  SPACE  to detonate a pacman explosion.', fontSize);
      ypos += offset * 3;
      this.addText(xpos, ypos, 'HINTS', fontSize);
      ypos += offset * 2;
      this.addText(xpos, ypos, 'Pacman\'s explosion destroys enemies. It can also damage your shields.', fontSize);
      ypos += offset * 2;
      this.addText(xpos, ypos, 'The Pacman grows bigger and bigger when eats food. Explosion range increases as well.', fontSize);
      ypos += offset * 2;
      this.addText(xpos, ypos, 'Your ship gets destroyed when its shields are depleted.', fontSize);
      ypos += offset * 2;
      this.addText(xpos, ypos, 'On some levels you\'ll shoot lasers instead of detonating Pacman.', fontSize);

      this.addText(cx - 330, height - 150, 'Press  attack  key  to  continue ...', 24);
      
      this.controls = this.controls = new Controls(this, true);
    });

    // always last
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);

    if (this.controls && (this.controls.action1 || this.controls.action2)) {
      this.scene.start('MainMenu');
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
      duration: 500,
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

}

export { HowToPlay };
