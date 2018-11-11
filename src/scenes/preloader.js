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
      bullets: {
        key: 'bullet',
        items: ['simple']
      },
      foods: {
        key: 'food',
        items: ['simple']
      },
    }

    this.load.bitmapFont(Globals.bitmapFont,
      require('../../assets/fonts/kenney_future_regular_24.png'),
      require('../../assets/xml/kenney_future_regular_24.xml'))

    this.load.atlasXML(Globals.atlas1, 
      require('../../assets/atlas-kenney/sheet.png'),
      require('../../assets/xml/sheet.xml'));

    // sprite assets
    Object.keys(assets).map(assetCategory => {
      assets[assetCategory].items.map(asset =>
        this.load.image(
          `${assets[assetCategory].key}-${asset}`,
          require(`../../assets/${assetCategory}/${asset}.png`)
        )
      )
    })
  }

  create() {
    // debug - start a game scene directly
    if (Globals.debug && Globals.scene) {
      this.scene.start(Globals.scene);
      return;
    }

    this.scene.start('MainMenu');
  }

}

export { Preloader };
