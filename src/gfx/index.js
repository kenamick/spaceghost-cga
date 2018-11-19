// gfx.js - common graphic effects
import Globals from '../globals';

const DURATIONS = {
  explosion: 1200,
  shields: 1500
};

const EXPLOSIONS = {
  'explosion-1': { atlas: Globals.atlas_px },
  'explosion-2': { atlas: Globals.atlas_regular },
  'explosion-3': { atlas: Globals.atlas_simple },
};

class Gfx {

  constructor(scene, audio) {
    this.scene = scene;
    this.audio = audio;
    
    this.addAnimations();
    this.bindEvents();
  }

  bindEvents() {
    this.scene.events.on('explosion', (config) => {
      this.scene.add.sprite(config.x, config.y, 
        EXPLOSIONS[config.name].atlas).play(config.name);
      // play sfx
      this.audio.playSound('explosions');
    });

    this.scene.events.on('shields', (config) => {
      const anim = this.scene.add.sprite(config.x, config.y, Globals.atlas1);
      if (config.cb) {
        anim.on('animationcomplete', config.cb)
      }
      anim.play('shields', true, 0);
      // TODO play sfx
    });
  }

  createAnim(sprite, visible = false) {
    const anim = this.scene.add.sprite(sprite.x, sprite.y, Globals.atlas1);
    anim.visible = true;
    return anim;
  }

  addAnimations() {
    const { scene } = this;

    Object.keys(EXPLOSIONS).map(key => {
      scene.anims.create({
        key: key,
        frames: scene.anims.generateFrameNames(EXPLOSIONS[key].atlas),
        duration: DURATIONS.explosion,
        repeat: 0,
        hideOnComplete: true
      });
    });
    // console.log(this.scene.anims.generateFrameNames(Globals.atlas_px,
    //   { end: 8, prefix: 'pixelExplosion', suffix: '.png', zeroPad: 2}));

    scene.anims.create({
      key: 'shields',
      frames: scene.anims.generateFrameNames(Globals.atlas1, {
        start: 1, end: 3, prefix: 'wingBlue_', suffix: '.png'}),
      frameRate: 30, //DURATIONS.shields,
      repeat: -1,
      hideOnComplete: false
    });
  }

}

export default Gfx;
