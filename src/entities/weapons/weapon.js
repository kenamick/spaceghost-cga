// weapon.js - Base Shooter
import { Math } from 'phaser';
import Globals from '../../globals';

class Weapon {

  constructor(scene, player, config) {
    this.scene = scene;
    this.player = player;

    this.bullets = scene.physics.add.group();
    this.bullets.createMultiple({
      key: 'bullet-simple',
      active: false,
      visible: false,
      repeat: 20,
      setScale: { x: 0.35, y: 0.35 },
      ...config,
    });

    this.nextFire = 0;
    this.bulletSpeed = 500;
    this.fireRate = 400;
  }

  fire(time) {
    if(time < this.nextFire)
      return;

    const bullet = this.bullets.getFirstDead();
    if(!bullet)
      return;

    const playerBody = this.player.sprite.body;

    bullet.enableBody(true, playerBody.center.x, playerBody.center.y, true, true);
    bullet.setAngle(playerBody.rotation);
    this.scene.physics.velocityFromAngle(playerBody.rotation, this.bulletSpeed + playerBody.speed, bullet.body.velocity);

    this.nextFire = time + this.fireRate;
  }

  update(time, delta) {
    scene.physics.world.wrap(this.bullets, 32);
  }

}

export { Weapon };
