// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';
import { Weapon } from '../weapons/weapon';

class FireFly {

  constructor(game, controls, config) {
    this.game = game;

    this.sprite = game.physics.add.image(config.x, config.y, 'ship-1-red');
    this.sprite.rotation = 3.14;
    this.sprite.setDepth(2);

    // this.sprite.setDamping(true);
    this.sprite.setDrag(150); //300
    this.sprite.setAngularDrag(400);
    this.sprite.setMaxVelocity(600);

    this.controls = controls;

    this.weapon = new Weapon(game, this);

    this.attachEngine();
  }

  attachEngine() {
    var particles = this.game.add.particles('p-red');
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
    const { controls, game, sprite, weapon } = this;

    if (controls.up) {
      game.physics.velocityFromRotation(sprite.rotation, 200, sprite.body.acceleration);
      weapon.fire(time);
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

    game.physics.world.wrap(sprite, 32);
  }

}

export { FireFly };
