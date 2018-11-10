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

  initShaders() {
    if (this.customPipeline) {
      this.cameras.main.setRenderToTexture(customPipeline);
    }
  }

  loadShaders() {
    this.customPipeline = Globals.game.renderer.addPipeline('Custom', 
      new KPPipeline(Globals.game, 'noise'));
    this.customPipeline.setFloat2('resolution', 
      Globals.game.config.width, Globals.game.config.height);
  }

  showFps() {
    if (Globals.debug || Globals.showFps) {
      this.fps = this.add.bitmapText(7, 5, Globals.bitmapFont, '-1', 7);
      this.fps.anchor.setTo(0.5);
      this.fps.fixedToCamera = true;
      this.world.bringToTop(this.fps);
    }
  }

  update(time, delta) {
    if (this.fps) {
      this.fps.text = this.game.time.fps;
    }

    if (this.customPipeline) {
      this.customPipeline.setFloat1('Time', this.time);
      this.shaderDeltaTime += 0.005;
    }
  }

}

export default BaseScene;
