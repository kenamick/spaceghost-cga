import Phaser, { Game } from 'phaser'


// From https://phaser.io/tutorials/getting-started-phaser3/part5

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    }
  },
  scene: {
    preload: preload,
    create: create,
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

function preload() {
  this.load.setBaseURL('http://labs.phaser.io');

  this.load.image('sky', 'assets/skies/space3.png');
  this.load.image('logo', 'assets/sprites/phaser3-logo.png');
  this.load.image('red', 'assets/particles/red.png');
}

function create() {
  this.add.image(400, 300, 'sky');

  var particles = this.add.particles('red');

  var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
  });

  var logo = this.physics.add.image(400, 100, 'logo');

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}
