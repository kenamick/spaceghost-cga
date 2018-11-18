// preloader.js - loads all game assets
import BaseScene from './base-scene';
import Globals from '../globals';
import Audio from '../audio';

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
    this.load.atlasXML(Globals.atlas_px,
      require('../../assets/atlas-kenney/spritesheet_pixelExplosion.png'),
      require('../../assets/xml/spritesheet_pixelExplosion.xml'));
    this.load.atlasXML(Globals.atlas_regular,
      require('../../assets/atlas-kenney/spritesheet_regularExplosion.png'),
      require('../../assets/xml/spritesheet_regularExplosion.xml'));
    this.load.atlasXML(Globals.atlas_simple,
      require('../../assets/atlas-kenney/spritesheet_simpleExplosion.png'),
      require('../../assets/xml/spritesheet_simpleExplosion.xml'));

    // sprite assets
    Object.keys(assets).map(assetCategory => {
      assets[assetCategory].items.map(asset =>
        this.load.image(
          `${assets[assetCategory].key}-${asset}`,
          require(`../../assets/${assetCategory}/${asset}.png`)
        )
      )
    })

    // load audio
    Audio.load(this);
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
