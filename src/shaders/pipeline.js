// pipline.js - custom shader pipeline
import Globals from '../globals';

/**
 * An attempt to add shaders.
 * 1. Phaser's examples - https://labs.phaser.io/index.html?dir=camera/
 * 2. Retro Shaders tuts - http://clemz.io/article-retro-shaders-webgl.html
 */

const KPPipeline = new Phaser.Class({

  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

  initialize:

    function KPPipeline(game, name) {
      Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
        game: game,
        renderer: game.renderer,
        fragShader: require(`./${name}.js`).code
      });
    }

});

const clearPipeline = () => {
  Globals.game.renderer.removePipeline('Custom');
};

const setPipeline = (name) => {
  if (Globals.pipeline) {
    clearPipeline();
  }

  Globals.pipeline = Globals.game.renderer.addPipeline('Custom',
    new KPPipeline(Globals.game, name));
    
  Globals.pipeline.setFloat2('resolution',
    Globals.game.config.width, Globals.game.config.height);
};

export {
  setPipeline,
  clearPipeline
};
