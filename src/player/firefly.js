// firefly.js - Player's glorious ship
import Globals from '../globals';
import Controls from '../controls';

class FireFly {

  constructor(game, config) {
    this.game = game;

    this.sprite = game.physics.add.image(config.x, config.y, 'ship-1-red');

    this.sprite.setDamping(true);
    this.sprite.setDrag(0.99);
    this.sprite.setMaxVelocity(200);

    this.controls = new Controls(game);
  }

  get gameSprite() {
    return this.sprite;
  }

  update() {
    const { controls, game, sprite } = this;

    if (controls.up) {
      game.physics.velocityFromRotation(sprite.rotation, 200, sprite.body.acceleration);
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
