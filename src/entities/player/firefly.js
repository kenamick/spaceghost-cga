// firefly.js - Player's glorious ship
import Phaser from 'phaser';
import Globals from '../../globals';
import { Weapon } from '../weapons/weapon';

const ACCEL = 180; // px/sec
const MAX_SPEED = 240;
const ROTATION_SPEED = 250;
const MAX_SHIELDS = 100;
const MAX_ENERGY = 100;

class FireFly {

  constructor(scene, controls, audio, config) {
    this.scene = scene;
    this.audio = audio;
    this.controls = controls;

    this.props = {
      shields: MAX_SHIELDS,
      energy: MAX_ENERGY,
    };

    this.sprite = scene.physics.add.image(config.x, config.y,
      Globals.atlas2, 'playerShip1_blue.png');
    this.sprite.texture.rotation = Phaser.Math.TAU;
    this.sprite.setDepth(Globals.depths.ship);

    // this.sprite.setDamping(true);
    this.sprite.setDrag(ACCEL * 0.1);
    this.sprite.setAngularDrag(ROTATION_SPEED * 4);
    this.sprite.setMaxVelocity(MAX_SPEED);

    // adjust collisions body
    this.sprite.setSize(this.sprite.width * 0.75, this.sprite.height * 0.5);

    this.weapon = new Weapon(scene, this, {
      dual: true, dualRadius: 25
    });

    this.dropFoodInterval = 0; // ? not sure if this is needed

    this.shields = this.createShieldsSprite();
    this.attachEngine(this.sprite);
    this.bindEvents();
  }

  bindEvents() {
    const bumpShields = (enemy, damage) => {
      this.showShields(enemy);
      // decrease shields
      this.props.shields -= damage;
      if (this.props.shields < 0) {
        this.props.shields = 0;
        this.scene.events.emit('hud-ship-stats', this.props);
        // kill ship and all its event handlers
        this.scene.events.emit('explosion', { x: this.sprite.x, y: this.sprite.y });
        this.sprite.destroy();
        this.emitter.stop();
        this.replenishTimer.destroy();
        // notify game scene
        this.scene.events.emit('gameover');
      } else {
        this.scene.events.emit('hud-ship-stats', this.props);
      }
    };
    this.sprite.on('hit-by-pacman', bumpShields);
    this.sprite.on('hit-by-ghost', bumpShields);
    this.sprite.on('hit-by-meteor', bumpShields);
    
    // replenish shields & energy 
    this.replenishTimer = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        this.props.shields = Math.min(this.props.shields + 0.09375, MAX_SHIELDS);
        this.props.energy = Math.min(this.props.energy + 0.375, MAX_ENERGY);
        this.scene.events.emit('hud-ship-stats', this.props);
      }
    });

    this.sprite.on('hit-by-explosion', (enemy, factor) => {
      // almost destroy ship
      const damage = Math.min(factor * 0.5, MAX_SHIELDS - 2);
      bumpShields(enemy, damage);
    });
  }

  showShields(enemy) {
    this.shields.x = this.sprite.x;
    this.shields.y = this.sprite.y;
    this.shields.visible = true;

    // adjust shield facing
    const theta = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y,
      enemy.x, enemy.y);
    this.shields.rotation = theta + Phaser.Math.TAU;

    this.shields.play('shields', true);
    // play sfx
    this.audio.playSound('shields', { random: true });
  }

  createShieldsSprite() {
    const shields = this.scene.add.sprite(this.sprite.x, this.sprite.y, Globals.atlas2);
    shields.visible = false;
    shields.setDepth(100);
    return shields;
  }

  attachEngine(ship) {
    var particles = this.scene.add.particles(Globals.atlas2, 'particle-red.png');
    var emitter = particles.createEmitter({
      speed: 100,
      x: {
        onEmit: () => Math.cos(
          ship.rotation - Phaser.Math.TAU - Math.PI) * ship.height * 0.6
      },
      y: {
        onEmit: () => Math.sin(
          ship.rotation - Phaser.Math.TAU - Math.PI) * ship.height * 0.6
      },
      lifespan: {
        //onEmit: () => Phaser.Math.Percent(ship.body.speed, 0, ACCEL) * 2000
        onEmit: () => Phaser.Math.Percent(ship.body.acceleration.lengthSq(), 
          0, ACCEL) * 2000
      },
      alpha: {
        onEmit: () => Phaser.Math.Percent(ship.body.speed, 0, MAX_SPEED)
      },
      angle: {
        onEmit: () => {
          // var v = 0.5 / Phaser.Math.Between(-10, 10);
          // return (ship.rotation - Math.PI + Math.TAU) + v;
          var v = Phaser.Math.Between(-10, 10);
          return (ship.angle - 180 + 90) + v;
        }
      },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD'
    });

    emitter.startFollow(ship);
    this.emitter = emitter;
  }

  update(time, delta, canShoot) {
    if (!this.sprite.active) {
      return;
    }

    const { controls, scene, sprite, weapon } = this;

    if (controls.up) {
      scene.physics.velocityFromRotation(
        sprite.rotation - Phaser.Math.TAU, ACCEL, sprite.body.acceleration);

      // pop food every 2 movement ticks
      if (this.dropFoodInterval >= 2) {
        this.sprite.emit('popFood', this.sprite.x, this.sprite.y);
        this.dropFoodInterval = 0;
      }
      this.dropFoodInterval += 1;
      // stop thrusters volume fade out
      if (this.thrustFadeTween) {
        this.thrustFadeTween.stop();
        this.thrustFadeTween = false;
      }
      // play sfx
      this.audio.setSoundVol('ship-thrust', 1);
      this.audio.playSound('ship-thrust', { modal: true, loop: true });
    } else {
      // no more accel => stop thrusters sound
      if (!this.thrustFadeTween && this.sprite.body.acceleration.lengthSq() > 0) {
        this.thrustFadeTween = this.scene.tweens.addCounter({
          from: 1,
          to: 0,
          duration: 800,
          onUpdate: (tween) => {
            this.audio.setSoundVol('ship-thrust', tween.getValue())
          },
          onComplete: () => {
            this.thrustFadeTween = false;
          }
        });
      }
      sprite.setAcceleration(0);
    }

    if (controls.left) {
      sprite.setAngularVelocity(-ROTATION_SPEED);
    } else if (controls.right) {
      sprite.setAngularVelocity(ROTATION_SPEED);
     } else {
      sprite.setAngularVelocity(0);
    }

    if (canShoot) {
      if (controls.action1 && this.props.energy > 4) {
        if (weapon.fire(time)) {
          this.props.energy = Math.max(this.props.energy - 4, 0);
        }
      }
    } else {
      if (controls.action1) {
        scene.events.emit('ignite-pacman');
      }
    }

    if (Globals.debug && controls.action2)  {
      scene.events.emit('level-won');
    }

    weapon.update(time, delta);
    scene.physics.world.wrap(sprite, sprite.width * 0.25);
  }

}

export { FireFly, MAX_SPEED };
