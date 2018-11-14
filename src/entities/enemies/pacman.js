// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';

const DEFAULT_ANIM_SPEED = 200;
const PacmanStates = {
  idle: 1,
  follow: 2,
  moveLeft: 3,
  moveRight: 4,
  moveUp: 5,
  moveDown: 6
}

class Pacman {

  constructor(screne, config) {
    this.scene = screne;

    this.config = config;

    this.sprite = this.createSprite(config.size, config.color, config.animSpeed);
    this.sprite.x = config.x;
    this.sprite.y = config.y;
    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    // bind a physics body to this render tex
    this.scene.physics.add.existing(this.sprite);

    this._state = PacmanStates.idle;
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

  setConfig(key, value) {
    this.config[key] = value;
  }

  setState(value, config) {
    this._state = value;

    switch (this._state) {
      case PacmanStates.moveLeft:
        this.sprite.body.setVelocity(-config.speed, 0);
      default:

      case PacmanStates.moveRight:
        this.sprite.body.setVelocity(config.speed, 0);
      break;

      case PacmanStates.follow:
        this.track();
      break;
      // TODO other states

      case PacmanStates.idle:
        break;
    }
  }

  track() {
    // this is a very naive approach to the nearest neighbor search
    // if anyone knows a better way change it please
    const { foods } = this.scene;
    let nearestFood = foods.getFirstAlive();
    let distance = Math.Distance.Between(this.sprite.x, this.sprite.y, nearestFood.x, nearestFood.y);
    let bestDistance = distance;
    for(let food of foods.getChildren()) {
      if(food.active) {
        distance = Math.Distance.Between(this.sprite.x, this.sprite.y, food.x, food.y);
        if(distance < bestDistance) {
          bestDistance = distance;
          nearestFood = food;
        }
      }
    }
    this.scene.physics.moveToObject(this.sprite, nearestFood);
  }

  update(time, delta) {
    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.size);
    }
  }

}

export { Pacman, PacmanStates };
