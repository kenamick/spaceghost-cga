// level4.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import { Ghost, GhostTypes, MeteorTypes } from '../../entities';

class Level4 extends BaseLevel {

  constructor() {
    super('Level4');
  }

  create() {
    super.create();
    this.setup();
  }

  setup() {
    this.thisScene = 'Level4';
    this.nextScene = {
      name: 'LoadLevel',
      next: 'Level5', text: 'L E V E L  5'
    };

    this.enemies = [
      new Ghost(this, {
        x: 100,
        y: 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost3,
      }),
      new Ghost(this, {
        x: this.game.config.width - 100,
        y: Globals.game.config.height - 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost1,
      })
    ];

    this.meteors.spawn(MeteorTypes.BIG, this.player.sprite.x - 400, 20);
    this.meteors.spawn(MeteorTypes.MEDIUM, this.game.config.width,
      this.game.height, -1);

    this.events.emit('spawn-pacman');
  }

}

export { Level4 };
