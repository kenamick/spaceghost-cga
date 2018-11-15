// level1.js - game play
import BaseScene from './base-scene';
import Globals from '../globals';
import Audio from '../audio';
import { FireFly, 
  Pacman, PacmanStates,
  Ghost, GhostStates
} from '../entities';
import Controls from '../controls';

class Level1 extends BaseScene {

  constructor() {
    super('Level1');
  }

  create() {
    super.addShaders();

    this.add.tileSprite(0, 0,
      Globals.game.config.width * 2, Globals.game.config.height * 2, 'bkg-purple');

    this.player = new FireFly(this, new Controls(this), { x: 100, y: 300 });
    this.player.sprite.on('popFood', this.popFood, this);

    this.cameras.main.setBounds(0, 0,
      Globals.game.config.width, Globals.game.config.height);

    this.foods = this.physics.add.group({
      defaultKey: 'food-simple',
    });

    this.addPacmans();
    this.addEnemies();

    // play music
    this.audio = new Audio(this);
    this.audio.playMusic('music-game', { loop: true });
    this.audio.setMusicVol('music-game', 0.5);

    // always last
    super.create();
  }

  addPacmans() {
    this.pacmans = [
      new Pacman(this, {
        x: 300, y: 190, size: 80, 
        color: Globals.palette.pacman.body
      })
    ];
  }

  addEnemies() {
    const topLeft = {x: 10, y: 10 };
    const topRight = {x: Globals.game.config.width - 50, y: 10 };

    this.enemies = [
      new Ghost(this, {
        x: topLeft.x, y: topLeft.y, size: 80,
        palette: Globals.palette.ghost1
      }),
      new Ghost(this, {
        x: topRight.x, y: topRight.y, size: 100,
        palette: Globals.palette.ghost2
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

      if (this.foods.countActive())
        pacman.setState(PacmanStates.follow);

      this.physics.overlap(pacman.sprite, this.foods, (pacman, food) => {
        this.foods.killAndHide(food);
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
  }

}

export { Level1 };
