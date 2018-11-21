// hud.js - user interface stuff
import Phaser from 'phaser';
import Globals from '../../globals';

class HUD {

  constructor(scene, config) {
    this.scene = scene;

    this.shieldsBar = this.scene.add.graphics();
    this.energyBar = this.scene.add.graphics();

    scene.events.on('hud-ship-stats', (props) => this.repaint(props));

    this.repaint(config.player.props);
  }

  repaint(props) {
    const { energyBar, shieldsBar } = this;

    const maxWidth = 500;
    const height = 20;
    const x = Globals.game.config.width * 0.5 - maxWidth * 0.5;

    shieldsBar.clear();
    shieldsBar.fillStyle(0xffffff, 1);
    shieldsBar.fillRect(x, 0, 
      maxWidth * (props.shields / 100), height);

    energyBar.clear();
    energyBar.fillStyle(0xffffff, 1);
    energyBar.fillRect(x, height + 4,
      maxWidth * (props.energy / 100), height);
  }


}

export { HUD };
