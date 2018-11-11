// base-state.js - common scene function calls
import Globals from '../globals';
import KPPipeline from '../shaders/pipeline';

class BaseScene extends Phaser.Scene {

  create() {
    // default background color
    // this.game.stage.backgroundColor = Globals.palette.menuBackground.hex;

    this.shaderDeltaTime = 0;

    this.showFps();
  }

  addShaders() {
    this.customPipeline = Globals.game.renderer.addPipeline('Custom', 
      new KPPipeline(Globals.game, 'noise'));
    this.customPipeline.setFloat2('resolution', 
      Globals.game.config.width, Globals.game.config.height);
    this.cameras.main.setRenderToTexture(this.customPipeline);
  }

  showFps() {
    if (Globals.debug || Globals.showFps) {
      this.fps = {
        count: 0,
        lastUpdateTime: 0,
        sprite: this.add.bitmapText(0, 5, Globals.bitmapFont, '', 14)
      };
      this.fps.sprite.fixedToCamera = true;
      this.children.bringToTop(this.fps.sprite);
    }
  }

  update(time, delta) {
    if (this.fps) {
      let currTime = Date.now();
      this.fps.counter++;
      if (currTime > this.fps.lastUpdateTime + 1000) {
        this.fps.lastUpdateTime = currTime;
        this.fps.sprite.setText(this.fps.counter);
        this.fps.counter = 0;
      }
    }

    if (this.customPipeline) {
      this.customPipeline.setFloat1('Time', this.shaderDeltaTime);
      this.shaderDeltaTime += 0.005;
    }
  }

}

export default BaseScene;
