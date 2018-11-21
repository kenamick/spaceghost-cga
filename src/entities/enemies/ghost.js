// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';

const DEFAULT_TRACK_INTERVAL = 350;
const DETECT_DISTANCE = 350 * 350; // 150 px
const TRACK_DISTANCE = 550 * 550; // 500 px
const TRACK_STOP_COOLDOWN = 1250; // ms

const GhostTypes = {
  SMALL: { animSpeed: 400, size: 50, speed: 210, drift: 0.09 },
  MEDIUM: { animSpeed: 650, size: 75, speed: 180, drift: -0.05 },
  BIG: { animSpeed: 750, size: 100, speed: 150, drift: 0.02 }
};

const GhostStates = {
  idle: 1,
  patrol: 2,
  follow: 3
};

class Ghost {

  constructor(scene, config) {
    this.scene = scene;

    this.config = {
      type: GhostTypes.SMALL,
      ...config
    };

    this.sprite = this.createSprite();
    this.sprite.x = config.x;
    this.sprite.y = config.y;

    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    //this.patrolState = this.createpatrolState(config.type);
    // bind a physics body to this render tex
    this.scene.physics.add.existing(this.sprite);

    this._state = GhostStates.patrol;
  }

  createSprite() {
    const { type } = this.config;
    const { body, eyes } = this.config.palette;
    const animSpeed = type.animSpeed;
    const size = type.size;

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
        graphics.fillStyle(body, 1);
        //graphics.fillGradientStyle(0xffff00, 0x00ffde, 0xff0000, 0xffb8de);
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
        graphics.fillStyle(eyes, 1);
        graphics.beginPath();
        graphics.moveTo(size * 0.15, size * 0.3);
        graphics.lineTo(size * 0.35, size * 0.45 - t * 0.2);
        graphics.lineTo(size * 0.40, size * 0.35);
        graphics.closePath();
        graphics.fillPath();

        // graphics.lineStyle(1, 0xffffff);
        graphics.fillStyle(eyes, 1);
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

  createPatrolState(ghostType) {
    let cfg;
    switch (ghostType) {
      case GhostTypes.SMALL:
        cfg = { ease: 'Linear', duration: 2000, yoyo: false, radius: 40 };
        break;
      case GhostTypes.MEDIUM:
        cfg = { ease: 'Sine.easeInOut', duration: 4000, yoyo: true, radius: 60 };
        break;
      case GhostTypes.BIG:
        cfg = { ease: 'Sine.easeInOut', duration: 6000, yoyo: true, radius: 70 };
        break;
    }

    const state = {
      t: 0,
      path: new Phaser.Curves.Path(),
      // this needs more work to derive the proper path coordinates
      // from sprite's position and curve radius
      curve: new Phaser.Curves.Ellipse(
        this.sprite.x, 
        this.sprite.y, 
        cfg.radius)
    };
    state.path.add(state.curve);

    state.tween = this.scene.tweens.add({
      targets: state,
      t: 1,
      repeat: -1,
      ...cfg
    });
    return state;
  }

  stopPatroling() {
    if (this.patrolState) {
      this.patrolState.tween.pause();
      this.patrolState.tween.stop();
    }
    if (this.patrolEvent) {
      this.patrolEvent.destroy();
      this.patrolEvent = null;
    }
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
        this.stopPatroling();
        this.track(config.target);
      break;

      case GhostStates.idle:
        this.stopPatroling();
        this.stopTracking();
        this.sprite.body.setVelocity(0, 0);
      break;

      case GhostStates.patrol:
        this.stopTracking();
        this.patrolState = this.createPatrolState(this.config.type);  
      break;
    }
  }

  stopTracking() {
    if (this.trackEvent) {
      this.trackEvent.destroy();
    }
  }

  track(target) {
    // clear old tracking event
    this.stopTracking();

    // adjust target vector
    this.scene.physics.moveToObject(this.sprite, target, this.config.type.speed);

    // re-adjust target vector every N ms.
    this.trackEvent = this.scene.time.addEvent({
      delay: DEFAULT_TRACK_INTERVAL,
      loop: true,
      callback: () => {
        this.scene.physics.moveToObject(this.sprite, target, this.config.type.speed);
      }
    });
  }

  update(time, delta, playerShip) {
    switch (this._state) {
      case GhostStates.patrol:
        if (playerShip) {
          // start following player if it's nearby
          const dist = Math.Distance.Squared(
            playerShip.x, playerShip.y, this.sprite.x, this.sprite.y);
          if (dist < DETECT_DISTANCE) {
            this.setState(GhostStates.follow, { target: playerShip });
            break;
          }
        }

        const vec = new Phaser.Math.Vector2();
        this.patrolState.path.getPoint(this.patrolState.t, vec);
        this.sprite.x = vec.x;
        this.sprite.y = vec.y;
        this.patrolState.curve.x += this.config.type.drift;
      break;

      case GhostStates.follow:
        if (playerShip) {
          // stop following player if it's too far
          const dist = Math.Distance.Squared(
            playerShip.x, playerShip.y, this.sprite.x, this.sprite.y);
          if (dist > TRACK_DISTANCE) {
            this.setState(GhostStates.idle);
            // chasing cooldown and then patrol
            this.patrolEvent = this.scene.time.addEvent({
              delay: TRACK_STOP_COOLDOWN,
              loop: false,
              callback: () => this.setState(GhostStates.patrol)
            });
          }
        }
      break;
    }

    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.type.size);
    }

  }

}

export { Ghost, GhostTypes, GhostStates };
