import Phaser, { Game, Math } from 'phaser';
import KPPipeline from './shaders/pipeline';
import { FireFly } from './player';
import Controls from './controls';
// From https://phaser.io/tutorials/getting-started-phaser3/part5

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      gravity: { y: 0 }
    }
  },
  input: {
    gamepad: true,
    keyboard: true
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Game(config);

const resize = () => {
  // https://stackoverflow.com/questions/51518818/how-to-make-canvas-responsive-using-phaser-3
  // https://www.emanueleferonato.com/2018/02/16/how-to-scale-your-html5-games-if-your-framework-does-not-feature-a-scale-manager-or-if-you-do-not-use-any-framework/
  const canvas = game.canvas
  const width = window.innerWidth
  const height = window.innerHeight
  const windowRatio = width / height
  const gameRatio = game.config.width / game.config.height

  if(windowRatio < gameRatio){
    canvas.style.width = width + 'px'
    canvas.style.height = (width / gameRatio) + 'px'
  }
  else {
    canvas.style.width = (height * gameRatio) + 'px'
    canvas.style.height = height + 'px'
  }
}

window.onload = () => {
  resize()
  window.addEventListener('resize', resize)
}

let customPipeline;

function preload() {
  // backgrounds
  ['purple', 'blue'].map(item => 
      this.load.image(`bkg-${item}`, require(`../assets/backdrops/${item}.png`)));
  // particles
  ['red'].map(item =>
    this.load.image(`p-${item}`, require(`../assets/particles/${item}.png`)));
  // ships
  ['1-red'].map(item =>
    this.load.image(`ship-${item}`, require(`../assets/ships/${item}.png`)));

  customPipeline = game.renderer.addPipeline('Custom', new KPPipeline(game, 'noise'));
  customPipeline.setFloat2('resolution', game.config.width, game.config.height);
} 

var player;

function create() {
  this.add.tileSprite(0, 0, 
    game.config.width * 2, game.config.height * 2, 'bkg-purple');

  player = new FireFly(this, new Controls(this), { x: 100, y: 300 });

  // var logo = this.physics.add.image(400, 100, 'logo');
  // logo.setVelocity(100, 200);
  // logo.setBounce(1, 1);
  // logo.setCollideWorldBounds(true);

  // add shader
  this.cameras.main.setBounds(0, 0, 1024, 2048);
  this.cameras.main.setRenderToTexture(customPipeline);
}

let time = 0;

function update(time, delta) {
  player.update(time, delta);

  customPipeline.setFloat1('Time', time);

  time += 0.005;
}
