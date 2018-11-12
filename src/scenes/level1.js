// level1.js - game play
import BaseScene from './base-scene';
import Globals from '../globals';
import { FireFly, Pacman } from '../entities';
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

    this.cameras.main.setBounds(0, 0, 
      Globals.game.config.width, Globals.game.config.height);

    this.pacman = new Pacman(this, {
      x: 10, y: 190,
      size: 100, color: 0xffff00
    });

    // always last
    super.create();
  }


  update(time, delta) {
    super.update(time, delta);

    this.player.update(time, delta);
    this.pacman.update(time, delta);
  }

}

export { Level1 };
