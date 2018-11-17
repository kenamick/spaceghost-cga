import Phaser, { Game, Math } from 'phaser';
import Globals from './globals';
import * as KPPL from './shaders/pipeline';

import {
  Preloader,
  MainMenu,
  Level1
} from './scenes';

const resize = () => {
  const game = Globals.game;
  if (game) {
    // https://stackoverflow.com/questions/51518818/how-to-make-canvas-responsive-using-phaser-3
    // https://www.emanueleferonato.com/2018/02/16/how-to-scale-your-html5-games-if-your-framework-does-not-feature-a-scale-manager-or-if-you-do-not-use-any-framework/
    const canvas = game.canvas
    const width = window.innerWidth
    const height = window.innerHeight
    const windowRatio = width / height
    const gameRatio = game.config.width / game.config.height

    if (windowRatio < gameRatio) {
      canvas.style.width = width + 'px'
      canvas.style.height = (width / gameRatio) + 'px'
    } else {
      canvas.style.width = (height * gameRatio) + 'px'
      canvas.style.height = height + 'px'
    }
  }
};

window.onload = function () {
  const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    antialias: false,
    physics: {
      default: 'arcade',
      arcade: {
        debug: Globals.debugPhysics, // || Globals.debug
        fps: 60,
        gravity: { y: 0 }
      }
    },
    input: {
      gamepad: true,
      keyboard: true
    },
    scene: [Preloader, MainMenu, Level1]
  };

  const game = new Game(config);
  Globals.game = game; // not quite nice!

  KPPL.setPipeline('noise');
  resize();
};

window.addEventListener('resize', resize);
