// level2.js - game play
import { BaseLevel } from './base-level';
import Globals from '../../globals';
import * as KPPL from '../../shaders/pipeline';
import {
  FireFly, HUD,
  Pacman, PacmanStates,
  Ghost, GhostTypes, GhostStates,
  Meteors, MeteorTypes,
} from '../../entities';

class Level2 extends BaseLevel {

  constructor() {
    super('Level2');
  }

  create() {
    super.create();
    this.setup();

    // play music
    //this.audio.playMusic('music-game', { loop: true });
    //this.audio.setMusicVol('music-game', 0.5);
  }

  setup() {
    // this.nextScene = {
    //   name: 'LoadLevel',
    //   next: 'Level3', text: 'L E V E L  3'
    // };
    this.nextScene = {
      name: 'LoadLevel', next: 'MainMenu', text: 'C O N G R A T U L A T I O N S',
      endgame: true
    };

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
        palette: Globals.palette.ghost1,
      })
    ];

    this.events.emit('spawn-pacman');
  }

}

export { Level2 };
