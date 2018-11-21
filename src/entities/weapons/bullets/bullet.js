// bullet.js - Base Bullet
import { Math, Sprite } from 'phaser';
import Globals from '../../../globals';

class Bullet extends Phaser.Physics.Arcade.Image {

  constructor(scene, config) {
    super(scene, config.x, config.y, Globals.atlas2, 'laserBlue01.png');

    this.setBlendMode('ADD');
    this.setDepth(0);
    this.setActive(false);
    this.setVisible(false);

    this.speed = 800;
    this.lifespan = 1000;
  }

  fire(x, y, angle) {
    this.currentLifespan = this.lifespan;
    this.enableBody(true, x, y, true, true);
    
    // TODO: sthg.'s not right here!
    // The image angle gets changed, but not the physics body angle!
    this.setAngle(angle);
    // decrease body size to counter physics body issue
    this.body.setSize(15, 15);

    this.scene.physics.velocityFromAngle(angle - 90, this.speed, 
      this.body.velocity);
  }

  update(time, delta) {
    this.currentLifespan -= delta;

    if(this.currentLifespan <= 0)
      this.disableBody(true, true);

    this.scene.physics.world.wrap(this);
  }

}

export { Bullet };
