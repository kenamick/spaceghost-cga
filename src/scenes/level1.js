// level1.js - game play
import BaseScene from './base-scene';
import Globals from '../globals';
import Audio from '../audio';
import { FireFly, 
  Pacman, PacmanStates,
  Ghost, GhostTypes, GhostStates
} from '../entities';
import Controls from '../controls';
import * as KPPL from '../shaders/pipeline';

class Level1 extends BaseScene {

  constructor() {
    super('Level1');
  }

  create() {
    // pre-init
    KPPL.setPipeline('noisycga');
    super.enableShaders();

    // background
    this.add.tileSprite(0, 0,
      Globals.game.config.width * 2, Globals.game.config.height * 2, 'bkg-purple');
    
    this.cameras.main.setBounds(0, 0,
      Globals.game.config.width, Globals.game.config.height);

    this.addPlayerShip();
    this.addPacmans();
    this.addEnemies();

    // play music
    this.audio = new Audio(this);
    //this.audio.playMusic('music-game', { loop: true });
    //this.audio.setMusicVol('music-game', 0.5);

    // always last
    super.create();
  }

  addPlayerShip() {
    this.foods = this.physics.add.group({
      defaultKey: 'food-simple',
    });

    this.player = new FireFly(this, new Controls(this), {
      x: this.cameras.main.centerX, 
      y: this.cameras.main.centerY 
    });
    this.player.sprite.on('popFood', this.popFood, this);
  }

  addPacmans() {
    this.pacmans = [
      new Pacman(this, {
        x: this.player.gameSprite.x, 
        y: this.player.gameSprite.y + 100 // Globals.game.config.height - 50
      })
    ];
  }

  addEnemies() {
    const offset = 50;
    const topLeft = { x: -offset, y: -offset };
    const bottomLeft = { x: -offset, y: Globals.game.config.height + offset};
    const topRight = { x: Globals.game.config.width + offset, y: -offset};
    const bottomRight = {x: Globals.game.config.width + offset, 
      y: Globals.game.config.height - offset};

    this.enemies = [
      new Ghost(this, {
        x: topLeft.x, y: topLeft.y, 
        palette: Globals.palette.ghost1
      }),
      new Ghost(this, {
        x: bottomLeft.x, y: bottomLeft.y, type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost4
      }),
      new Ghost(this, {
        x: topRight.x, y: topRight.y, type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost3
      }),
      new Ghost(this, {
        x: bottomRight.x, y: bottomRight.y, 
        palette: Globals.palette.ghost4
      })
    ];

    // track player ship
    for (const enemy of this.enemies) {
      enemy.setState(GhostStates.follow, { target: this.player.gameSprite });
    }
  }

  update(time, delta) {
    super.update(time, delta);

    this.player.update(time, delta);

    // --- ghosts AI
    for (const enemy of this.enemies) {
      enemy.update(time, delta);
    }

    // --- pacmans AI
    for (const pacman of this.pacmans) {
      pacman.update(time, delta);

      this.physics.overlap(pacman.sprite, this.foods, (pacmanSprite, food) => {
        this.foods.killAndHide(food);

        // TODO add pacman grows

        if (this.foods.countActive()) {
          pacmanSprite.emit('setState', PacmanStates.trackFood);
        } else {
          pacmanSprite.emit('setState', PacmanStates.idle);
        }
      });
    }
  }

  popFood(x, y) {
    const food = this.foods.get();
    if(!food)
      return;

    // get "tile" position of (x, y) coordinate
    let posX = Math.floor(x / food.width);
    let posY = Math.floor(y / food.height);

    // then place food in the "center of the tile"
    posX = posX * food.width + food.width / 2;
    posY = posY * food.height + food.height / 2;

    food.enableBody(true, posX, posY, true, true);
    this.physics.overlap(food, this.foods, () => {
      food.disableBody(true, true);
    });

    // tell pacman it's time to get movin
    this.pacmans.map(pacman => 
      pacman.gameSprite.emit('setState', PacmanStates.trackFood));
  }

}

export { Level1 };
