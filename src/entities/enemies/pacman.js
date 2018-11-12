// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';

const DEFAULT_ANIM_SPEED = 200;

class Pacman {

  constructor(screne, config) {
    this.scene = screne;
    this.sprite = this.createSprite(config.size, config.color);
    this.sprite.x = config.x;
    this.sprite.y = config.y;
    // bind a physics body to this render tex
    this.scene.physics.add.existing(this.sprite);
  }

  createSprite(size, color, animSpeed = DEFAULT_ANIM_SPEED) {
    const rt = this.scene.add.renderTexture(0, 0, size, size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.scene.tweens.addCounter({
      from: 0,
      to: 30,
      duration: animSpeed,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const t = tween.getValue();
        // thx Phaser guys! - https://labs.phaser.io/edit.html?src=src/game%20objects/graphics/pacman%20arc%20chomp%20chomp.js
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.slice(size * 0.5, size * 0.5, 
          size * 0.5, // radius
          Phaser.Math.DegToRad(330 + t), 
          Phaser.Math.DegToRad(30 - t), 
          true);
        graphics.fillPath();
        // update render tex w/h new image
        rt.clear();
        rt.draw(graphics, 0, 0);
      }
    });

    return rt;
  }

  get gameSprite() {
    return this.sprite;
  }

  update(time, delta) {
    this.sprite.x += 0.5;
  }

}

export { Pacman };
