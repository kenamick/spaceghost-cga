// level5.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import { Ghost, GhostTypes, MeteorTypes } from '../../entities';

class Level5 extends BaseLevel {

  constructor() {
    super('Level5');
  }

  create() {
    this.musicTrack = 'music-game2';
    super.create();
    this.setup();
  }

  setup() {
    const { width, height } = this.game.config;

    this.thisScene = 'Level5';
    this.nextScene = {
      name: 'LoadLevel',
      next: 'MainMenu',
      endgame: true
    };

    this.enemies = [
      new Ghost(this, {
        x: 50,
        y: height - 50,
        type: GhostTypes.BIG,
        palette: Globals.palette.ghost4,
      }),
      new Ghost(this, {
        x: width - 50,
        y: height - 80,
        type: GhostTypes.BIG,
        palette: Globals.palette.ghost1,
      })
    ];

    this.meteors.spawn(MeteorTypes.BIG, this.player.sprite.x - 15, 5,
      1, 1, Globals.palette.meteor1);
    this.meteors.spawn(MeteorTypes.BIG, this.player.sprite.x + 15,
      height - 5, -1, -1, Globals.palette.meteor3);

    this.events.emit('spawn-pacman');
  }

}

export { Level5 };
