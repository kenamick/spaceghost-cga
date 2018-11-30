// level2.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import { Ghost, GhostTypes } from '../../entities';

class Level2 extends BaseLevel {

  constructor() {
    super('Level2');
  }

  create() {
    super.create();
    this.setup();
  }

  setup() {
    this.thisScene = 'Level2';
    this.nextScene = {
      name: 'LoadLevel',
      next: 'Level3', text: 'L E V E L  3'
    };

    this.enemies = [
      new Ghost(this, {
        x: this.player.sprite.x - 50,
        y: 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost1,
      }),
      new Ghost(this, {
        x: this.player.sprite.x + 50,
        y: Globals.game.config.height - 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost3,
      })
    ];

    this.events.emit('spawn-pacman');
  }

}

export { Level2 };
