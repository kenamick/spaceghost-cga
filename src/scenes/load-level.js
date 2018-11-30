// interlude.js - loads all game assets
import BaseScene from './base-scene';
import Globals from '../globals';
import Audio from '../audio';
import Controls from '../controls';
import * as KPPL from '../shaders/pipeline';
import * as Scenes from './index';

class LoadLevel extends BaseScene {

  constructor() {
    super('LoadLevel');
  }

  init(data) {
      // test
      data = {
        endgame: true,
        name: 'EndGame',
        next: 'MainMenu'
      };

    if (data.next) {
      this.config = data;
      if (data.endgame) {
        this.config.text = 'W E L L   D O N E'
      }
    } else {
      this.config = { next: 'Level1', text: 'L E V E L  1' };
    }
  }

  create() {
    // pre-init
    KPPL.setPipeline('noise');
    super.enableShaders();

    const { width, height } = Globals.game.config;

    // background
    const backg = this.add.tileSprite(0, 0, width * 2, height * 2, 'bkg-blue');
    backg.setDepth(0);

    const cx = width * 0.5;
    const cy = height * 0.5;
    let titleX = cx - 190;

    if (this.config.endgame) {
      titleX = cx - 250;
    }

    this.addTitle(titleX, cy - 150, this.config.text, 48, () => {
      this.addText(cx - 330, height - 150, 'Press  attack  key  to  continue ...', 24); 
      this.controls = this.controls = new Controls(this, true);

      if (this.config.endgame) {
        this.addText(cx - 240, cy + 50, 'The galaxy is safe ...for now!', 20); 
      }
    });

    // always last
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);

    if (this.controls && (this.controls.action1 || this.controls.action2)) {
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once('camerafadeoutcomplete', (camera) => {
        if (this.config.next !== 'MainMenu') {
          // load scene here, because any old refs were removed
          this.scene.add(this.config.next, Scenes[this.config.next]);
        }
        this.scene.start(this.config.next);
      });
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
      duration: 800,
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

export { LoadLevel };
