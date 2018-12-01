// level4.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import { Ghost, GhostTypes, MeteorTypes } from '../../entities';

class Level4 extends BaseLevel {

  constructor() {
    super('Level4');
  }

  create() {
    this.canShoot = true;
    this.musicTrack = 'music-game2';
    super.create();
    this.setup();
  }

  setup() {
    const { width, height } = this.game.config;

    this.thisScene = 'Level4';
    this.nextScene = {
      name: 'LoadLevel',
      next: 'Level5', text: 'L E V E L  5'
    };

    this.enemies = [];

    this.meteors.spawn(MeteorTypes.BIG, 5, 5, 1, 1,
      Globals.palette.meteor1);
    this.meteors.spawn(MeteorTypes.BIG, width - 5, 5, -1, 1,
      Globals.palette.meteor2);
    this.meteors.spawn(MeteorTypes.BIG, 5, height - 5, 1, -1,
      Globals.palette.meteor3);
    this.meteors.spawn(MeteorTypes.BIG, width - 5, height - 5, -1, -1,
      Globals.palette.meteor4);

    this.events.emit('spawn-pacman');
  }

}

export { Level4 };
