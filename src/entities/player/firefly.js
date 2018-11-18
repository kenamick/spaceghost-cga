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
      Globals.atlas1, 'playerShip1_red.png');
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

    this.attachEngine(this.sprite);
  }

  attachEngine(ship) {
    var particles = this.scene.add.particles('p-red');
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

    weapon.update(time, delta);
    scene.physics.world.wrap(sprite, sprite.width * 0.5);
  }

}

export { FireFly };
