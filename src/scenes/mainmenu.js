// mainmenu.js - game menu
import BaseScene from './base-scene';
import Globals from '../globals';

class MainMenu extends BaseScene {
  
  constructor() {
    super('MainMenu');
  }

  create() {
    this.add.tileSprite(0, 0,
      Globals.game.config.width * 2,
      Globals.game.config.height * 2, 'bkg-blue');

    // always last
    super.create();
  }

}

export { MainMenu };
