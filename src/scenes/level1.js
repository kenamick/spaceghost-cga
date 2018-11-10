// level1.js - game play
import BaseScene from './base-scene';
import Globals from '../globals';
import { FireFly } from '../entities';
import Controls from '../controls';

class Level1 extends BaseScene {

  constructor() {
    super('Level1');
  }

  create() {
    super.create();
    super.addShaders();

    this.add.tileSprite(0, 0,
      Globals.game.config.width * 2, 
      Globals.game.config.height * 2, 'bkg-purple');

    this.player = new FireFly(this, new Controls(this), { x: 100, y: 300 });

    // add shader
    this.cameras.main.setBounds(0, 0, 1024, 2048);
  }


  update(time, delta) {
    super.update(time, delta);

    this.player.update(time, delta);
  }

}

export { Level1 };
