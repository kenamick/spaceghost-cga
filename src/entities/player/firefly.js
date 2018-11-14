// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';
import { Weapon } from '../weapons/weapon';

class FireFly {

  constructor(scene, controls, config) {
    this.scene = scene;

    this.sprite = scene.physics.add.image(config.x, config.y,
      Globals.atlas1, 'playerShip1_red.png');
    this.sprite.texture.rotation = Math.TAU;
    this.sprite.setDepth(2);

    // this.sprite.setDamping(true);
    this.sprite.setDrag(150); //300
    this.sprite.setAngularDrag(400);
    this.sprite.setMaxVelocity(600);

    this.controls = controls;

    this.weapon = new Weapon(scene, this);

    this.attachEngine();
  }

  attachEngine() {
    var particles = this.scene.add.particles('p-red');
    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      followOffset: new Math.Vector2(40, 0),
      follow: this.sprite
    });
  //emitter.startFollow(player.gameSprite);
  }

  get gameSprite() {
    return this.sprite;
  }

  update(time, delta) {
    const { controls, scene, sprite, weapon } = this;

    if (controls.up) {
      scene.physics.velocityFromRotation(sprite.rotation - Math.TAU, 200, sprite.body.acceleration);
    } else {
      sprite.setAcceleration(0);
    }

    if (controls.left) {
      sprite.setAngularVelocity(-300);
    } else if (controls.right) {
      sprite.setAngularVelocity(300);
    } else {
      sprite.setAngularVelocity(0);
    }

    if (controls.action1) {
      weapon.fire(time);
    }

    weapon.update(time, delta);
    scene.physics.world.wrap(sprite, 32);
  }

}

export { FireFly };
