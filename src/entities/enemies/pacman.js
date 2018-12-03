// firefly.js - Player's glorious ship
import Phaser from 'phaser';
import Globals from '../../globals';

const DEFAULT_SIZE = 50; // px
const DEFAULT_SPEED = 120; // px
const DEFAULT_ANIM_SPEED = 200; // ms
const GROWTH_FACTOR = 0.35;
// const GROWTH_FACTOR = 0.001;
const WARP_OFFSET = 350; // min px, before warping past screen edge
const HIT_STOP_COOLDOWN = 1500;
const PACMAN_RASPAWN_TIME = 3000;

const PacmanStates = {
  idle: 1,
  trackFood: 2,
  trackShip: 3,
  moveLeft: 4,
  moveRight: 5,
  dead: 6,
}

class Pacman {

  constructor(scene, audio, config) {
    this.scene = scene;
    this.audio = audio;

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
      // console.log('GROWTH', this._growthFactor);
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

    this.sprite.on('ignite', (ghosts, meteors, ship) => {
      if (!this.explodeTween) {
        this.audio.playSound('ignite');
        this.explodeTween = this.scene.tweens.addCounter({
          from: 100,
          to: 0,
          duration: 1000,
          onUpdate: (tween) => this.scene.events.emit('hud-ship-stats', { 
            timer: tween.getValue() }),
          onComplete: () => {
            this.explodeTween = null;
            this.scene.events.emit('hud-ship-stats', { noTimer: true }),
            this.sprite.emit('explode', ghosts, meteors, ship);
          }
        });
      }
    });

    this.sprite.on('explode', (ghosts, meteors, ship) => {
      // clear explosion range line
      if (this.rangeGraphics) {
        this.rangeGraphics.clear();
      }
      // big explosion
      this.scene.events.emit('explosion', {
        x: this.sprite.x, y: this.sprite.y, scaleSize: this._growthFactor
      });
      // shake screen
      this.scene.cameras.main.shake(500 + this._growthFactor);
      // kill pacman sprite
      this.setState(PacmanStates.dead);
      this.sprite.destroy();
      this.tween.stop();
      // destroy all enemies in proximity
      const explodeFn = (entity) => {
        entity.emit('hit-by-explosion',
          this.sprite, this.config.size + this._growthFactor)
      };
      ghosts.map(ghost => this.hitCheck(ghost.sprite, explodeFn));
      meteors.getChildren().map(meteor => this.hitCheck(meteor, explodeFn));
      this.hitCheck(ship, explodeFn);
      // spawn another pacman
      this.scene.time.addEvent({
        delay: PACMAN_RASPAWN_TIME,
        callback: () => this.scene.events.emit('spawn-pacman')
      });
    });
  }

  createSprite() {
    const { color, animSpeed } = this.config;

    const rt = this.scene.add.renderTexture(0, 0, this.config.size, 
      this.config.size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.tween = this.scene.tweens.addCounter({
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
    if (!this.sprite.active) {
      return;
    }

    this._state = value;

    let speed = this.config.speed;
    if (config) {
      speed = config.speed;
    }

    switch (this._state) {
      case PacmanStates.moveLeft:
        this.sprite.body.setVelocity(-speed, 0);
      default:

      case PacmanStates.moveRight:
        this.sprite.body.setVelocity(speed, 0);
      break;

      case PacmanStates.trackFood:
        this.track();
      break;

      // case PacmanStates.trackShip:
      //   this.audio.stop('pacman-eats');
      // break;

      case PacmanStates.idle:
        this.sprite.body.setVelocity(0, 0);
      break;

      case PacmanStates.dead:
        this.audio.stop('pacman-eats');
      break;
    }
  }

  track() {
    // this is a very naive approach to the nearest neighbor search
    // if anyone knows a better way change it please
    const { foods } = this.scene;
    
    let nearestFood = foods.getFirstAlive();
    if (nearestFood) {
      let distance = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, 
        nearestFood.x, nearestFood.y);
      let bestDistance = distance;
      for(let food of foods.getChildren()) {
        if(food.active) {
          distance = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, 
            food.x, food.y);
          if(distance < bestDistance) {
            bestDistance = distance;
            nearestFood = food;
          }
        }
      }

      this.scene.physics.moveToObject(this.sprite, nearestFood, this.config.speed);
      this.facePos(nearestFood.x, nearestFood.y);
      // play sfx
      this.audio.playSound('pacman-eats', { modal: true });
    }
  }

  facePos(x, y) {
    // good ol'atan2 ;-)
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, x, y);
    this.sprite.rotation = angle;
  }

  hitCheck(entity, cb) {
    if (entity.active) {
      const dist = Phaser.Math.Distance.Squared(
        this.sprite.x, this.sprite.y, entity.x, entity.y);

      // pacman explosion range
      let range = (this.config.size + this._growthFactor) * 2.45;
      // console.log('DIST', range);
      range *= range;

      if (dist < range) {
        cb(entity, this.sprite);
      }
    }
  }

  drawLine(from, to) {
    if (!this.rangeGraphics) {
      this.rangeGraphics = this.scene.add.graphics().setVisible(true);
    }
    const line = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
    // this.rangeGraphics.clear();
    this.rangeGraphics.lineStyle(4, 0xff00ff);
    this.rangeGraphics.strokeLineShape(line);
    this.rangeGraphics.setDepth(100);    
  }

  drawExplosionRange(entities) {
    if (this.rangeGraphics) {
      this.rangeGraphics.clear();
    }
    this.hitCheck(entities.ship, (entity, pacman) => this.drawLine(pacman, entity));
    entities.ghosts.map(ghost => this.hitCheck(ghost, 
      (entity, pacman) => this.drawLine(pacman, entity)));
    entities.meteors.getChildren().map(meteor => this.hitCheck(meteor, 
      (entity, pacman) => this.drawLine(pacman, entity)));
  }

  stopSfx() {
    this.audio.stop('pacman-eats');
  }

  update(time, delta, entities) {
    if (!this.sprite.active) {
      return;
    }

    if (entities) {
      this.drawExplosionRange(entities);
    }

    switch (this._state) {
      case PacmanStates.trackShip:
        if (entities.ship.active) {
          this.facePos(entities.ship.x, entities.ship.y);
          this.scene.physics.moveToObject(this.sprite, entities.ship, this.config.speed);
        }
      break;
    }

    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.size);
    }
  }

}

export { Pacman, PacmanStates };
