// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';
import { MeteorTypes } from './meteors';
import * as FireFly from '../player/firefly';

const DEFAULT_TRACK_INTERVAL = 350;
const DETECT_DISTANCE = 550 * 550; // 150 px
const TRACK_DISTANCE = 450 * 450; // 500 px
const TRACK_STOP_COOLDOWN = 1250; // ms
const HIT_STOP_COOLDOWN = 1200;

const GhostTypes = {
  SMALL: { animSpeed: 400, size: 50, speed: FireFly.MAX_SPEED, drift: 0.09 },
  MEDIUM: { animSpeed: 650, size: 75, speed: FireFly.MAX_SPEED * 0.85, drift: -0.05 },
  BIG: { animSpeed: 750, size: 100, speed: FireFly.MAX_SPEED * 0.70, drift: 0.02 }
};

const GhostStates = {
  idle: 1,
  patrol: 2,
  follow: 3,
  dead: 4
};

class Ghost {

  constructor(scene, config) {
    this.scene = scene;

    this.config = {
      type: GhostTypes.SMALL,
      fromT: 0,
      toT: 1,
      startState: GhostStates.patrol,
      ...config
    };

    this.sprite = this.createSprite();
    this.sprite.setDepth(Globals.depths.ghost);
    this.sprite.x = config.x;
    this.sprite.y = config.y;

    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    //this.patrolState = this.createpatrolState(config.type);
    // bind a physics body to this render tex
    this.sprite = this.scene.physics.add.existing(this.sprite);

    // adjust collisions body
    this.sprite.body.setSize(this.sprite.width * 0.9, this.sprite.height * 0.8);

    this.setState(this.config.startState);

    this.bindEvents();
  }

  bindEvents() {
    this.sprite.on('hit-by-pacman', (pacman, size) => {
      const { sprite } = this;
      // kill if ghost smaller than pacman  
      if (sprite.width + sprite.height <= size) {
        // spawn meteor
        this.scene.events.emit('spawn-meteor-from', MeteorTypes.BIG, this.sprite);
        // kill ghost
        this.setState(GhostStates.dead);
        this.scene.events.emit('explosion', { x: sprite.x, y: sprite.y });
        this.sprite.destroy();
      }
    });

    // this.sprite.on('hit-by-bullet', (bullet) => {
    //   // shields gfx
    //   this.scene.events.emit('shields', {
    //     x: bullet.x,
    //     y: bullet.y,
    //     angle: Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y,
    //       bullet.x, bullet.y) + Phaser.Math.TAU
    //   });

    //   if (!this.slowdown) {
    //     this.setState(GhostStates.idle);
    //     // swing in direction of bullet
    //     this.sprite.body.setVelocity(
    //       bullet.body.velocity.x * 0.1,
    //       bullet.body.velocity.y * 0.1);

    //     this.slowdown = this.scene.time.addEvent({
    //       delay: HIT_STOP_COOLDOWN,
    //       loop: false,
    //       callback: () => {
    //         this.slowdown = null;
    //         this.setState(GhostStates.patrol);
    //       }
    //     });
    //   }
    // });

    this.sprite.on('hit-by-explosion', () => {
      // destroy and spawn smaller ghosts
      this.scene.events.emit('explosion', { x: this.sprite.x, y: this.sprite.y });
      this.setState(GhostStates.dead);
      this.sprite.destroy();
      this.tween.stop();
      // spawn new ghost
      let config;
      if (this.config.type === GhostTypes.MEDIUM) {
        this.scene.events.emit('spawn-ghost', {
            type: GhostTypes.SMALL,
            palette: this.config.palette,
            x: this.sprite.x - this.sprite.width,
            y: this.sprite.y - this.sprite.height
        });
        this.scene.events.emit('spawn-ghost', {
          type: GhostTypes.SMALL,
          palette: this.config.palette,
          x: this.sprite.x + this.sprite.width,
          y: this.sprite.y + this.sprite.height,
          fromT: 1, // rotation params
          toT: 0
        });
      } else if (this.config.type === GhostTypes.BIG) {
        this.scene.events.emit('spawn-ghost', {
          type: GhostTypes.MEDIUM,
          palette: this.config.palette,
          x: this.sprite.x + this.sprite.width,
          y: this.sprite.y + this.sprite.height
        });
        this.scene.events.emit('spawn-ghost', {
          type: GhostTypes.MEDIUM,
          palette: this.config.palette,
          x: this.sprite.x - this.sprite.width,
          y: this.sprite.y - this.sprite.height,
          fromT: 1, // rotation params
          toT: 0
        });
      }
    });
  }

  createSprite() {
    const { type } = this.config;
    const { body, eyes } = this.config.palette;
    const animSpeed = type.animSpeed;
    const size = type.size;

    const rt = this.scene.add.renderTexture(0, 0, size, size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.tween = this.scene.tweens.addCounter({
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
      t: this.config.fromT,
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
      t: this.config.toT,
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

  setConfig(key, value) {
    this.config[key] = value;
  }

  setState(value, config) {
    if (!this.sprite.active) {
      return;
    }

    this._state = value;

    switch (this._state) {
      case GhostStates.follow:
        this.stopPatroling();
      break;

      case GhostStates.idle:
        this.stopPatroling();
        this.sprite.body.setVelocity(0, 0);
      break;

      case GhostStates.patrol:
        this.patrolState = this.createPatrolState(this.config.type);  
      break;

      case GhostStates.dead:
        this.stopPatroling();
        this.sprite.body.setVelocity(0, 0);
      break;
    }
  }

  get state() {
    return this._state;
  }

  update(time, delta, playerShip) {
    if (!this.sprite.active) {
      return;
    }

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
          const width = Globals.game.config.width;
          const height = Globals.game.config.width;

          const dist = Math.Distance.Squared(
            playerShip.x, playerShip.y, this.sprite.x, this.sprite.y);

          let targetX = playerShip.x;
          let targetY = playerShip.y;

          if (playerShip.body.speed < FireFly.MAX_SPEED * 0.85) {
            // try to be smart by warping through the screen edges
            // but only if the ship is moving slower than 75% of its max speed
            if (this.sprite.x < width * 0.5) {
              const d_edge_me = Math.Distance.Squared(0, playerShip.y, 
                this.sprite.x, this.sprite.y);
              const d_edge_ship = Math.Distance.Squared(playerShip.x, playerShip.y, 
                width, this.sprite.y);
              if (d_edge_me + d_edge_ship < dist) {
                targetX = -(this.sprite.width * 2);
              }
            } else {
              const d_edge_me = Math.Distance.Squared(width, playerShip.y, 
                this.sprite.x, this.sprite.y);
              const d_edge_ship = Math.Distance.Squared(playerShip.x, playerShip.y, 
                0, this.sprite.y);
              if (d_edge_me + d_edge_ship < dist) {
                targetX = width + this.sprite.width * 2;
              }
            }

            if (this.sprite.y < height * 0.5) {
              const d_edge_me = Math.Distance.Squared(playerShip.x, 0,
                this.sprite.x, this.sprite.y);
              const d_edge_ship = Math.Distance.Squared(playerShip.x, playerShip.y,
                this.sprite.x, height);
              if (d_edge_me + d_edge_ship < dist) {
                targetY = -(this.sprite.height * 2);
              }
            } else {
              const d_edge_me = Math.Distance.Squared(playerShip.x, height,
                this.sprite.x, this.sprite.y);
              const d_edge_ship = Math.Distance.Squared(playerShip.x, playerShip.y,
                this.sprite.x, height);
              if (d_edge_me + d_edge_ship < dist) {
                targetY = height + this.sprite.height * 2;
              }
            }
          }

          this.scene.physics.moveTo(this.sprite, targetX, targetY, this.config.type.speed);

          // stop following player if it's too far
          // const dist = Math.Distance.Squared(
          //   playerShip.x, playerShip.y, this.sprite.x, this.sprite.y);
          // if (dist > TRACK_DISTANCE) {
          //   this.setState(GhostStates.idle);
          //   // chasing cooldown and then patrol
          //   this.patrolEvent = this.scene.time.addEvent({
          //     delay: TRACK_STOP_COOLDOWN,
          //     loop: false,
          //     callback: () => this.setState(GhostStates.patrol)
          //   });
          // }
        }
      break;
    }

    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.type.size * 0.7);
    }

  }

}

export { Ghost, GhostTypes, GhostStates };
