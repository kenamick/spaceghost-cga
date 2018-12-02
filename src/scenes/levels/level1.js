// level1.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import { Ghost, GhostTypes, GhostStates } from '../../entities';

class Level1 extends BaseLevel {

  constructor() {
    super('Level1');
  }

  create() {
    this.playerY = this.cameras.main.centerY + 200;
    super.create();
    this.setup();
  }

  setup() {
    this.thisScene = 'Level1';
    this.nextScene = { 
      name: 'LoadLevel', 
      next: 'Level2', text: 'L E V E L  2' 
    };

    this.enemies = [
      new Ghost(this, {
        x: this.player.sprite.x,
        y: 100,
        type: GhostTypes.BIG,
        palette: Globals.palette.ghost1,
        startState: GhostStates.patrol
      })
    ];

    this.events.emit('spawn-pacman');
  }

}

export { Level1 };
