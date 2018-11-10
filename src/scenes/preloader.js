// preloader.js - loads all game assets
import BaseScene from './base-scene';
import Globals from '../globals';

class Preloader extends BaseScene {

  constructor() {
    super('Preloader');
  }

  preload() {
    const assetsDir = '../../assets';
    
    // backgrounds
    ['purple', 'blue'].map(item =>
      this.load.image(`bkg-${item}`, require(`${assetsDir}/backdrops/${item}.png`)));
    // particles
    ['red'].map(item =>
      this.load.image(`p-${item}`, require(`${assetsDir}/particles/${item}.png`)));
    // ships
    ['1-red'].map(item =>
      this.load.image(`ship-${item}`, require(`${assetsDir}/ships/${item}.png`)));
    // bullets
    ['simple'].map(item =>
      this.load.image(`bullet-${item}`, require(`${assetsDir}/bullets/${item}.png`)));
    // foods
    ['simple'].map(item =>
      this.load.image(`food-${item}`, require(`${assetsDir}/foods/${item}.png`)));

    super.loadShaders();
  }

  create() {
    const { game } = this;

    // debug - start directly a game state
    if (Globals.debug && Globals.scene) {
      this.state.start(Globals.scene);
    }

    // set background to the game average color (optional)
    //this.game.stage.backgroundColor = Globals.palette.menuBackground.hex;

    this.scene.start('Level1');
  }

}

export { Preloader };
