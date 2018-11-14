// level1.js - game play
import BaseScene from './base-scene';
import Globals from '../globals';
import { FireFly, Pacman, PacmanStates } from '../entities';
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

    this.pacman = new Pacman(this, {
      x: 10, y: 190,
      size: 100, color: 0xffff00
    });

    this.foods = this.physics.add.group({
      defaultKey: 'food-simple',
    });

    // always last
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);

    this.player.update(time, delta);
    this.pacman.update(time, delta);

    if(this.foods.countActive())
      this.pacman.setState(PacmanStates.follow)

    this.physics.overlap(this.pacman.sprite, this.foods, (pacman, food) => {
      this.foods.killAndHide(food);
    });
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
