// firefly.js - Player's glorious ship
import Phaser from 'phaser';
import Globals from '../../globals';

const DEFAULT_SIZE = 50; // px
const DEFAULT_SPEED = 120; // px
const DEFAULT_ANIM_SPEED = 200; // ms
const GROWTH_FACTOR = 0.01;
// const GROWTH_FACTOR = 0.001;
const WARP_OFFSET = 350; // min px, before warping past screen edge
const HIT_STOP_COOLDOWN = 1500;

const PacmanStates = {
  idle: 1,
  trackFood: 2,
  moveLeft: 3,
  moveRight: 4,
  moveUp: 5,
  moveDown: 6,
  dead: 7,
}

class Pacman {

  constructor(scene, config) {
    this.scene = scene;

    this.config = {
      color: Globals.palette.pacman.body,
      animSpeed: DEFAULT_ANIM_SPEED,
      speed: DEFAULT_SPEED,
      size: DEFAULT_SIZE,
      ...config
    };

    this.sprite = this.createSprite();
    this.sprite.x = config.x;
    this.sprite.y = config.y;
    this.sprite.setOrigin(0.5);

    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    // bind a physics body to this render tex
    this.sprite = this.scene.physics.add.existing(this.sprite);
    this.sprite.setDepth(Globals.depths.pacman);

    // adjust collisions body
    this.sprite.body.setSize(this.sprite.width * 0.9, this.sprite.height * 0.9);

    this._growthFactor = 0;
    this._state = PacmanStates.idle;

    this.bindEvents();
  }

  get size() {
    return this.config.size + this._growthFactor;
  }

  bindEvents() {
    this.sprite.on('setState', (newState) => this.setState(newState));

    this.sprite.on('eatFood', () => {
      this._growthFactor += GROWTH_FACTOR;
      this.sprite.setDisplaySize(
        this.config.size + this._growthFactor,
        this.config.size + this._growthFactor
      );
      // this.sprite.scaleX += GROWTH_FACTOR;
      // this.sprite.scaleY += GROWTH_FACTOR;
    });

    this.sprite.on('hit-by-bullet', (bullet) => {
      // shields gfx
      this.scene.events.emit('shields', {
        x: bullet.x,
        y: bullet.y,
        angle: Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y,
          bullet.x, bullet.y) + Phaser.Math.TAU
      });

      if (!this.slowdown) {
        // swing in direction of bullet
        this.sprite.body.setVelocity(
          bullet.body.velocity.x * 0.1, 
          bullet.body.velocity.y * 0.1);

        this.slowdown = this.scene.time.addEvent({
          delay: HIT_STOP_COOLDOWN,
          loop: false,
          callback: () => this.slowdown = null
        });
      }
    });
  }

  createSprite() {
    const { color, animSpeed } = this.config;

    const rt = this.scene.add.renderTexture(0, 0, this.config.size, 
      this.config.size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.scene.tweens.addCounter({
      from: 0,
      to: 30,
      duration: animSpeed,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const size = this.config.size;
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

      case PacmanStates.trackFood:
        this.track();
      break;
      // TODO other states

      case PacmanStates.idle:
        this.sprite.body.setVelocity(0, 0);
      break;
    }
  }

  track() {
    // this is a very naive approach to the nearest neighbor search
    // if anyone knows a better way change it please
    const { foods } = this.scene;
    let nearestFood = foods.getFirstAlive();
    let distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, nearestFood.x, nearestFood.y);
    let bestDistance = distance;
    for(let food of foods.getChildren()) {
      if(food.active) {
        distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, food.x, food.y);
        if(distance < bestDistance) {
          bestDistance = distance;
          nearestFood = food;
        }
      }
    }

    this.scene.physics.moveToObject(this.sprite, nearestFood, this.config.speed);

    // always face target food, good ol'atan2 ;-)
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y,
      nearestFood.x, nearestFood.y);
    this.sprite.rotation = angle;
  }

  update(time, delta) {
    // if (this._state === PacmanStates.idle) {
    //   const { x, y } = this.sprite;
    //   if (x < WARP_OFFSET) {
    //     this.scene.physics.moveToObject(this.sprite, -WARP_OFFSET,
    //       y, this.config.speed);
    //   // } else if (x > this.scene.game.config.width - WARP_OFFSET) {
    //   //   this.scene.physics.moveToObject(this.sprite, this.scene.game.config.width + WARP_OFFSET,
    //   //     y, this.config.speed);
    //   } else {
    //     this.sprite.body.setVelocity(0, 0);
    //   }
    // }

    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.size);
    }
  }

}

export { Pacman, PacmanStates };
