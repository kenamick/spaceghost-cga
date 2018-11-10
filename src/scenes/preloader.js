// preloader.js - loads all game assets
import BaseScene from './base-scene';
import Globals from '../globals';

class Preloader extends BaseScene {

  constructor() {
    super('Preloader');
  }

  preload() {
    const assets = {
      backdrops: {
        key: 'bkg',
        items: ['purple', 'blue']
      },
      particles: {
        key: 'p',
        items: ['red']
      },
      ships: {
        key: 'ship',
        items: ['1-red']
      },
      bullets: {
        key: 'bullet',
        items: ['simple']
      },
      foods: {
        key: 'food',
        items: ['simple']
      },
    }

    Object.keys(assets).map(assetCategory => {
      assets[assetCategory].items.map(asset =>
        this.load.image(
          `${assets[assetCategory].key}-${asset}`,
          require(`../../assets/${assetCategory}/${asset}.png`)
        )
      )
    })

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
