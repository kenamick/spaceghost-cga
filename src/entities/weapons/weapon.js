// weapon.js - Base Shooter
import { Math } from 'phaser';
import Globals from '../../globals';
import { Bullet } from './bullets/bullet';

class Weapon {

  constructor(scene, player, config) {
    this.scene = scene;
    this.player = player;

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true,
    });

    this.nextFire = 0;
    this.fireRate = 400;
    this.amountShots = 0;
  }

  fire(time) {
    if(time < this.nextFire)
      return;

    const bullet = this.bullets.get();
    if(!bullet)
      return;

    const { center, rotation } = this.player.sprite.body;
    bullet.fire(center.x, center.y, rotation);

    this.nextFire = time + this.fireRate;
    this.amountShots++;

    if(this.amountShots >= 2) {
      this.player.sprite.emit('popFood', this.player.sprite.x, this.player.sprite.y);
      this.amountShots = 0;
    }
  }

  update(time, delta) {
  }

}

export { Weapon };
