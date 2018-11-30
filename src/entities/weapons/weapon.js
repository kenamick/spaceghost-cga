// weapon.js - Base Shooter
import Phaser from 'phaser';
import Globals from '../../globals';
import { Bullet } from './bullets/bullet';

const DEFAULT_RATE = 140;

class Weapon {

  constructor(scene, player, config) {
    this.scene = scene;
    this.player = player;
    this.config = {
      rate: DEFAULT_RATE,
      dual: false,
      offset: 0,
      ...config
    };

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true,
    });

    this.nextFire = 0;
    //this.amountShots = 0;
  }

  fire(time) {
    if(time < this.nextFire)
      return false;

    const { center, rotation } = this.player.sprite.body;

    if (!this.config.dual) {
      // single fire
      const bullet = this.bullets.get();
      if (!bullet)
        return;

      bullet.fire(center.x, center.y, rotation);
    } else {
      // dual fire
      let bullet = this.bullets.get();
      if (bullet) {
        const phi_x = Math.cos(this.player.sprite.rotation) * this.config.dualRadius;
        const phi_y = Math.sin(this.player.sprite.rotation) * this.config.dualRadius;

        bullet.fire(center.x + phi_x, center.y + phi_y, rotation);

        bullet = this.bullets.get();
        if (bullet) {
          bullet.fire(center.x - phi_x, center.y - phi_y, rotation);
        }
      }
    }

    this.nextFire = time + this.config.rate;
    //this.amountShots++;

    // play sfx
    this.scene.audio.playSound('ship-laser');

    return true;
  }

  checkHits(enemies, meteors) {
    // this.scene.physics.overlap(this.bullets, enemies, (enemy, bullet) => {
    //   if (this.bullets.countActive()) {
    //     this.bullets.killAndHide(bullet);
    //     // trigger enemy hit
    //     enemy.emit('hit-by-bullet', bullet);
    //   }
    // });
    this.scene.physics.overlap(this.bullets, meteors, (bullet, meteor) => {
      if (this.bullets.countActive()) {
        this.bullets.killAndHide(bullet);
        // trigger enemy hit
        meteor.emit('hit-by-bullet', bullet);
      }
    });
  }

  update(time, delta) {
  }

}

export { Weapon };
