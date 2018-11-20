// firefly.js - Player's glorious ship
import Phaser from 'phaser';
import Globals from '../../globals';
import { Weapon } from '../weapons/weapon';

const ACCEL = 200; // px/sec
const MAX_SPEED = 280;
const ROTATION_SPEED = 250;

class FireFly {

  constructor(scene, controls, config) {
    this.scene = scene;

    this.sprite = scene.physics.add.image(config.x, config.y,
      Globals.atlas2, 'playerShip1_blue.png');
    this.sprite.texture.rotation = Phaser.Math.TAU;
    this.sprite.setDepth(2);

    // this.sprite.setDamping(true);
    this.sprite.setDrag(ACCEL * 0.1);
    this.sprite.setAngularDrag(ROTATION_SPEED * 4);
    this.sprite.setMaxVelocity(MAX_SPEED);

    this.controls = controls;

    this.weapon = new Weapon(scene, this, {
      rate: 100, dual: true, dualRadius: 25
    });

    this.dropFoodInterval = 0; // ? not sure if this is needed

    this.shields = this.createShieldsSprite();
    this.attachEngine(this.sprite);
    this.bindEvents();
  }

  bindEvents() {
    this.sprite.on('hit-by-pacman', (pacman) => {
      this.shields.x = this.sprite.x;
      this.shields.y = this.sprite.y;
      this.shields.visible = true;

      // adjust shield facing
      const theta = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y,
        pacman.x, pacman.y);
      this.shields.rotation = theta + Phaser.Math.TAU;

      // TODO hitpoints substract

      this.shields.play('shields', true);
    });
  }

  createShieldsSprite() {
    const shields = this.scene.add.sprite(this.sprite.x, this.sprite.y, Globals.atlas2);
    shields.visible = false;
    shields.setDepth(100);
    return shields;
  }

  attachEngine(ship) {
    var particles = this.scene.add.particles(Globals.atlas2, 'particle-red.png');
    var emitter = particles.createEmitter({
      speed: 100,
      x: {
        onEmit: () => Math.cos(
          ship.rotation - Phaser.Math.TAU - Math.PI) * ship.height * 0.6
      },
      y: {
        onEmit: () => Math.sin(
          ship.rotation - Phaser.Math.TAU - Math.PI) * ship.height * 0.6
      },
      lifespan: {
        onEmit: () => Phaser.Math.Percent(ship.body.speed, 0, 300) * 2000
      },
      alpha: {
        onEmit: () => Phaser.Math.Percent(ship.body.speed, 0, 300)
      },
      angle: {
        onEmit: () => {
          // var v = 0.5 / Phaser.Math.Between(-10, 10);
          // return (ship.rotation - Math.PI + Math.TAU) + v;
          var v = Phaser.Math.Between(-10, 10);
          return (ship.angle - 180 + 90) + v;
        }
      },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD'
    });

    emitter.startFollow(ship);
  }

  get gameSprite() {
    return this.sprite;
  }

  update(time, delta) {
    const { controls, scene, sprite, weapon } = this;

    if (controls.up) {
      scene.physics.velocityFromRotation(
        sprite.rotation - Phaser.Math.TAU, ACCEL, sprite.body.acceleration);

      // pop food every 2 movement ticks
      if (this.dropFoodInterval >= 2) {
        this.sprite.emit('popFood', this.sprite.x, this.sprite.y);
        this.dropFoodInterval = 0;
      }
      this.dropFoodInterval += 1;

    } else {
      sprite.setAcceleration(0);
    }

    if (controls.left) {
      sprite.setAngularVelocity(-ROTATION_SPEED);
    } else if (controls.right) {
      sprite.setAngularVelocity(ROTATION_SPEED);
    // } else {
      //sprite.setAngularVelocity(0);
    }

    if (controls.action1) {
      weapon.fire(time);
    }
    if (controls.action2) {
      if (!this.what) {
        // this.scene.events.emit('explosion', { x: 100, y: 200, name: 'explosion-1' });
        this.scene.events.emit('shields', { x: 100, y: 200, name: 'shields' });
        this.what = true;
      } else {
        this.what = false;
      }
    }

    weapon.update(time, delta);
    scene.physics.world.wrap(sprite, sprite.width * 0.5);
  }

}

export { FireFly };
