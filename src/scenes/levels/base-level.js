// base-level.js - basis gameplay elements
import BaseScene from '../base-scene';
import Globals from '../../globals';
import Audio from '../../audio';
import Gfx from '../../gfx';
import * as KPPL from '../../shaders/pipeline';
import {
  FireFly, HUD,
  Pacman, PacmanStates,
  Ghost, GhostTypes, GhostStates,
  Meteors, MeteorTypes,
} from '../../entities';
import Controls from '../../controls';

class BaseLevel extends BaseScene {

  create() {
    // pre-init
    KPPL.setPipeline('noisycga');
    super.enableShaders();

    // background
    this.add.tileSprite(0, 0,
      Globals.game.config.width * 2, Globals.game.config.height * 2, 'bkg-purple');

    this.cameras.main.setBounds(0, 0,
      Globals.game.config.width, Globals.game.config.height);

    this.gameover = false;
    this.audio = new Audio(this);

    // load animations and fx
    this.gfx = new Gfx(this, this.audio);

    this.addPlayerShip();
    this.bindEvents();

    this.meteors = new Meteors(this, this.audio);

    // play music
    if (!this.musicTrack) {
      this.musicTrack = 'music-game1';
    }
    this.audio.setMusicVol(this.musicTrack, 0.6);
    this.audio.playMusic(this.musicTrack, { loop: true });
    // this.audio.fadeIn(null, { maxVol: 0.9 });

    // always last
    super.create();
  }

  bindEvents() {
    this.events.on('gameover', () => {
      // show game over text
      this.player.stopSfx();
      const bitmap = this.add.bitmapText(
        Globals.game.config.width * 0.5 - 180,
        Globals.game.config.height * 0.5 - 16 * 8,
        Globals.bitmapFont, 'G A M E   O V E R', 32);
      bitmap.alpha = 0;
      this.tweens.add({
        targets: [bitmap],
        alpha: 1,
        duration: 1500,
        ease: 'Easing.Bounce.Out',
        onComplete: () => {
          // fade out & switch to menu
          this.cameras.main.fadeOut(3000);
          this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            // cleanup scene events and objects
            this.events.off();
            this.scene.remove(this.thisScene);
            // kill all sound
            this.audio.stop();
            // go to menu
            this.scene.start('MainMenu');
          });
        }
      });
    });

    this.events.on('level-won', () => {
      if (this.gameover) {
        return;
      }
      this.player.stopSfx();
      // show game over text
      const bitmap = this.add.bitmapText(
        Globals.game.config.width * 0.5 - 280,
        Globals.game.config.height * 0.5 - 16 * 8,
        Globals.bitmapFont, 'L E V E L   C L E A R E D', 32);
      bitmap.alpha = 0;
      this.tweens.add({
        targets: [bitmap],
        alpha: 1,
        duration: 3000,
        ease: 'Easing.Bounce.Out',
        onComplete: () => {
          // fade out & switch to menu
          this.cameras.main.fadeOut(3000);
          this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            // cleanup scene events and objects
            this.events.off();
            this.scene.remove(this.thisScene);
            // go to next level
            this.scene.start(this.nextScene.name, this.nextScene);
          });
        }
      });
    });

    this.events.on('ignite-pacman', () => {
      if (this.pacman.sprite.active) {
        this.pacman.sprite.emit('ignite', this.enemies, this.meteors.meteors,
          this.player.sprite);
      }
    });

    this.events.on('spawn-pacman', () => {
      this.pacman = new Pacman(this, this.audio, {
        x: this.player.sprite.x,
        y: this.player.sprite.y + 100 // Globals.game.config.height - 50
      });
    });

    this.events.on('spawn-ghost', (config) => {
      const ghost = new Ghost(this, {
        palette: Globals.palette.ghost1,
        ...config
      });

      let found = false;
      for (let i = 0; i < this.enemies.length; i++) {
        if (!this.enemies[i].sprite.active) {
          this.enemies[i] = ghost;
          found = true;
          break;
        }
      }
      if (!found) {
        this.enemies.push(ghost);
      }
    });
  }

  addPlayerShip() {
    this.foods = this.physics.add.group({
      defaultKey: Globals.atlas2,
      defaultFrame: 'food-simple.png'
    });

    this.player = new FireFly(this, new Controls(this), this.audio, {
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY
    });
    this.player.sprite.on('popFood', this.popFood, this);

    this.hud = new HUD(this, { 
      player: this.player,
      showEnergy: this.canShoot
    });
  }

  update(time, delta) {
    if (this.levelWon) {
      return;
    }

    const ship = this.player.sprite;
    const ghostSprites = [];

    super.update(time, delta);

    // --- ghosts AI ---
    if (ship.active) {
      for (const enemy of this.enemies) {
        if (enemy.sprite.active) {
          enemy.update(time, delta, ship);
          ghostSprites.push(enemy.sprite);
        }
      }
    }

    // --- meteors Manager ---
    this.meteors.update(time, delta, ship);

    // --- pacmans AI ---
    this.pacman.update(time, delta, {
      ship, ghosts: ghostSprites, meteors: this.meteors.meteors
    });

    this.physics.overlap(this.pacman.sprite, this.foods, (pacmanSprite, food) => {
      if (this.foods.countActive()) {
        if (food.active) {
          this.foods.killAndHide(food);

          // trigger pacman growth
          pacmanSprite.emit('eatFood');

          if (this.foods.countActive()) {
            pacmanSprite.emit('setState', PacmanStates.trackFood);
          } else {
            pacmanSprite.emit('setState', PacmanStates.trackShip);
          }
        }
      }
    });

    if (ship.active) {
      this.physics.overlap(ghostSprites, ship, (enemySprite, ship) =>
        ship.emit('hit-by-ghost', enemySprite, Globals.damage.ghost));

      this.physics.overlap(this.pacman.sprite, ship,
        (pacman, ship) => ship.emit('hit-by-pacman', pacman, Globals.damage.pacman));
    }

    // ---- game win check
    if (ship.active && ghostSprites.length === 0 && 
      this.meteors.meteors.countActive() === 0 && !this.gameover) {
      this.levelWon = true;
      this.events.emit('level-won');
    }

    // this.physics.overlap(this.pacman.sprite, ghostSprites,
    //   (sprite, ghost) => ghost.emit('hit-by-pacman', sprite, this.pacman.config.size * 2));

    // --- player ---
    this.player.update(time, delta, this.canShoot);
    this.player.weapon.checkHits([...ghostSprites, this.pacman.sprite], 
      this.meteors.meteors);
  }

  popFood(x, y) {
    const food = this.foods.get();
    if (!food)
      return;

    // get "tile" position of (x, y) coordinate
    let posX = Math.floor(x / food.width);
    let posY = Math.floor(y / food.height);

    // then place food in the "center of the tile"
    posX = posX * food.width + food.width / 2;
    posY = posY * food.height + food.height / 2;

    food.setDepth(Globals.depths.food);

    food.enableBody(true, posX, posY, true, true);
    this.physics.overlap(food, this.foods, () => {
      food.disableBody(true, true);
    });

    // tell pacman it's time to get movin
    this.pacman.sprite.emit('setState', PacmanStates.trackFood);
  }

}

export { BaseLevel };
