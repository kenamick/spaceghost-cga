// gfx.js - common graphic effects
import Phaser from 'phaser';
import Globals from '../globals';

const DURATIONS = {
  explosion: 1200,
  shields: 2000
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
      let name = config.name;
      if (!name) {
        const names = Object.keys(EXPLOSIONS);
        name = names[Phaser.Math.Between(0, names.length - 1)];
      }

      const sprite = this.scene.add.sprite(config.x, config.y, 
        EXPLOSIONS[name].atlas).play(name);
      sprite.setDepth(Globals.depths.explosion);

      if (config.scale) {
        sprite.setDisplaySize(sprite.width * config.scale, 
          sprite.height * config.scale);
        sprite.setDepth(Globals.depths.smallExplosion);
      } else if (config.scaleSize) {
        sprite.setDisplaySize(sprite.width + config.scaleSize,
          sprite.height + config.scaleSize);
        sprite.setDepth(Globals.depths.smallExplosion);
      }

      sprite.on('animationcomplete', () => {
        sprite.destroy();
        if (config.cb) {
          config.cb()
        }
      });
      // play sfx
      if (config && !config.noSfx) {
        this.audio.playSound('explosions', { random: true });
      }
    });

    this.scene.events.on('shields', (config) => {
      const anim = this.scene.add.sprite(config.x, config.y, Globals.atlas2);
      anim.setDepth(Globals.depths.shields);
      if (config.cb) {
        anim.on('animationcomplete', config.cb)
      }
      if (config.angle) {
        anim.rotation = config.angle;
      }
      anim.on('animationcomplete', () => anim.destroy());
      anim.play('shields', true, 0);
      // play sfx
      this.audio.playSound('shields', { random: true });
    });
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
      frames: scene.anims.generateFrameNames(Globals.atlas2, {
        start: 1, end: 3, prefix: 'shield', suffix: '.png'}),
      frameRate: DURATIONS.shields,
      repeat: 0,
      hideOnComplete: true
    });
  }

}

export default Gfx;
