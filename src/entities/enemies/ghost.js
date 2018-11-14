// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';

const DEFAULT_ANIM_SPEED = 500;
const DEFAULT_TRACK_INTERVAL = 1500;

const GhostStates = {
  idle: 1,
  follow: 2,
  moveLeft: 3,
  moveRight: 4,
  moveUp: 5,
  moveDown: 6
};

class Ghost {

  constructor(screne, config) {
    this.scene = screne;

    // defaults
    config.palette = config.palette || {};
    config.bodyColor = config.palette.body || Globals.palette.ghost4.body;
    config.eyeColor = config.palette.eyes || Globals.palette.ghost4.eyes;

    this.config = config;

    this.sprite = this.createSprite(config.size, 
      config.bodyColor, config.eyeColor, config.animSpeed);
    this.sprite.x = config.x;
    this.sprite.y = config.y;
    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    // bind a physics body to this render tex
    this.scene.physics.add.existing(this.sprite);

    this._state = GhostStates.idle;
  }

  createSprite(size, color, eyeColor, animSpeed = DEFAULT_ANIM_SPEED) {
    const rt = this.scene.add.renderTexture(0, 0, size, size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.scene.tweens.addCounter({
      from: 0,
      to: 10,
      duration: animSpeed,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const t = tween.getValue();

        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(size * 0.5, size * 0.38, size, size * 0.7);

        const offset = size * 0.15 - t;
        const d_offset = t;
        
        graphics.beginPath();
        graphics.moveTo(0, size * 0.4);
        graphics.lineTo(2, size - d_offset);
        graphics.lineTo(size * 0.25, size - offset);
        graphics.lineTo(size * 0.5, size - d_offset);
        graphics.lineTo(size * 0.75, size - offset);
        graphics.lineTo(size - 2, size - d_offset);
        graphics.lineTo(size, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        
        // graphics.lineStyle(1, 0xffffff);
        graphics.fillStyle(eyeColor, 1);
        graphics.beginPath();
        graphics.moveTo(size * 0.15, size * 0.3);
        graphics.lineTo(size * 0.35, size * 0.45 - t * 0.2);
        graphics.lineTo(size * 0.40, size * 0.35);
        graphics.closePath();
        graphics.fillPath();

        // graphics.lineStyle(1, 0xffffff);
        graphics.fillStyle(eyeColor, 1);
        graphics.beginPath();
        graphics.moveTo(size - size * 0.15, size * 0.3);
        graphics.lineTo(size - size * 0.35, size * 0.45 - t * 0.2);
        graphics.lineTo(size - size * 0.40, size * 0.35);
        graphics.closePath();
        graphics.fillPath();

        // update render tex w/h new image
        rt.clear();
        rt.draw(graphics, 0, 0);
      }
    });

    return rt;
  }

  get gameSprite() {
    return this.sprite;
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  setState(value, config) {
    this._state = value;

    switch (this._state) {
      case GhostStates.follow:
        this.track(config.target);
        break;

      case GhostStates.idle:
        break;
    }
  }

  track(target) {
    // clear old tracking event
    if (this.trackEvent) {
      this.trackEvent.destroy();
    }

    // adjust target vector
    this.scene.physics.moveToObject(this.sprite, target);

    // re-adjust target vector every N ms.
    this.trackEvent = this.scene.time.addEvent({
      delay: DEFAULT_TRACK_INTERVAL,
      loop: true,
      callback: () => {
        this.scene.physics.moveToObject(this.sprite, target);
      }
    });
  }

  update(time, delta) {
    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.size);
    }
  }

}

export { Ghost, GhostStates };
