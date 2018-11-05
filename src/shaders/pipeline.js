// pipline.js - custom shader pipeline

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

export default KPPipeline;
