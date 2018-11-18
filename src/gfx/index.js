// gfx.js - common graphic effects
import Globals from '../globals';

const EXPLOSION_ANIM_DURATION = 1200;

const EXPLOSIONS = {
  'explosion-1': { atlas: Globals.atlas_px },
  'explosion-2': { atlas: Globals.atlas_regular },
  'explosion-3': { atlas: Globals.atlas_simple },
};

class Gfx {

  constructor(scene) {
    this.scene = scene;
    
    this.addExplosions();
    this.bindEvents();
  }

  bindEvents() {
    this.scene.events.on('explosion', (config) => {
      this.scene.add.sprite(config.x, config.y, 
        EXPLOSIONS[config.name].atlas).play(config.name);
        // TODO play sfx
    });
  }

  addExplosions() {
    const { scene } = this;
    Object.keys(EXPLOSIONS).map(key => {
      scene.anims.create({
        key: key,
        frames: scene.anims.generateFrameNames(EXPLOSIONS[key].atlas),
        duration: EXPLOSION_ANIM_DURATION,
        repeat: 0
      });
    });
    // console.log(this.scene.anims.generateFrameNames(Globals.atlas_px,
    //   { end: 8, prefix: 'pixelExplosion', suffix: '.png', zeroPad: 2}));
  }

}

export default Gfx;
