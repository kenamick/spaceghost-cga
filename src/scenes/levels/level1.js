// level1.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import * as KPPL from '../../shaders/pipeline';
import { FireFly, HUD,
  Pacman, PacmanStates,
  Ghost, GhostTypes, GhostStates, 
  Meteors, MeteorTypes,
} from '../../entities';

class Level1 extends BaseLevel {

  constructor() {
    super('Level1');
  }

  create() {
    super.create();
    this.setup();

    // play music
    //this.audio.playMusic('music-game', { loop: true });
    //this.audio.setMusicVol('music-game', 0.5);
  }

  setup() {
    this.nextScene = 'Level2';

    const xpos = this.player.sprite.x - GhostTypes.MEDIUM.size * 0.5;

    this.enemies = [
      new Ghost(this, {
        x: xpos,
        y: 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost1,
      }),
      new Ghost(this, {
        x: xpos, 
        y: Globals.game.config.height - 100,
        type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost4
      })
    ];

    this.events.emit('spawn-pacman');
  }

}

export { Level1 };
