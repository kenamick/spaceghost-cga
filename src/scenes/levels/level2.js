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

    // play music
    //this.audio.playMusic('music-game', { loop: true });
    //this.audio.setMusicVol('music-game', 0.5);

    this.setup();
  }

  setup() {
    this.nextScene = 'Level1';
    this.addEnemies();
    this.events.emit('spawn-pacman');
  }

  addEnemies() {
    const offset = -100;
    const topLeft = { x: -offset, y: -offset };
    const bottomLeft = { x: -offset, y: Globals.game.config.height + offset };
    const topRight = { x: Globals.game.config.width + offset, y: -offset };
    const bottomRight = {
      x: Globals.game.config.width + offset,
      y: Globals.game.config.height + offset
    };

    this.enemies = [
      new Ghost(this, {
        x: Globals.game.config.width * 0.5, y: topLeft.y, type: GhostTypes.MEDIUM,
        palette: Globals.palette.ghost1
      }),
      // new Ghost(this, {
      //   x: bottomLeft.x, y: bottomLeft.y, type: GhostTypes.MEDIUM,
      //   palette: Globals.palette.ghost4
      // }),
      // new Ghost(this, {
      //   x: topRight.x, y: topRight.y, type: GhostTypes.BIG,
      //   palette: Globals.palette.ghost3
      // }),
      // new Ghost(this, {
      //   x: bottomRight.x, y: bottomRight.y, type: GhostTypes.SMALL,
      //   palette: Globals.palette.ghost4
      // })
    ];

    // track player ship
    for (const enemy of this.enemies) {
      enemy.setState(GhostStates.patrol, { target: this.player.sprite });
    }

    this.meteors.spawn(MeteorTypes.BIG, 100, 400);
  }

}

export { Level2 };
