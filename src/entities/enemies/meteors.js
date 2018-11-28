// firefly.js - Player's glorious ship
import Phaser from 'phaser';
import Globals from '../../globals';

const MeteorTypes = {
  SMALL: { rotSpeed: 1.6, size: 0.2, speedx: 100, speedy: 100, hp: 10 },
  MEDIUM: { rotSpeed: 0.8, size: 0.5, speedx: 60, speedy: 60, hp: 25 },
  BIG: { rotSpeed: 0.2, size: 1, speedx: 40, speedy: 40, hp: 50 }
};

class Meteors {

  constructor(scene, config) {
    this.scene = scene;

    this.config = {
      ...config
    };

    this.meteors = scene.physics.add.group({
      defaultKey: Globals.atlas2,
      defaultFrame: 'meteor1.png'
    });

    this.scene.events.on('spawn-meteor-from', 
      (type, obj) => this.spawnFrom(type, obj));
  }

  spawnFrom(type, obj) {
    let x, y, vx, vy;
    const offset = 80;
    const cx = Globals.game.config.width * 0.33;
    const cy = Globals.game.config.height * 0.33;
    x = obj.x;
    // x = obj.x < cx ? -offset : Globals.game.config.width + offset;
    vx = obj.x < cx ? 1 : -1;
    y = obj.y < cy ? -offset : Globals.game.config.height + offset;
    vy = obj.y < cy ? 1 : -1;
    this.spawn(type, x, y, vx, vy);
  }

  spawn(type, x, y, vx = 1, vy = 1) {
    const meteor = this.meteors.get();
    if (meteor) {
      meteor.type = type;
      meteor.hp = type.hp;
      meteor.vx = vx;
      meteor.vy = vy;
      this.bindEvents(meteor);

      meteor.setDepth(Globals.depths.meteor);
      meteor.enableBody(true, x, y, true, true);
      // set collision surface bit smaller
      meteor.body.setSize(meteor.width * 0.75, meteor.height * 0.75);
      meteor.scaleX = type.size;
      meteor.scaleY = type.size;
      meteor.body.setVelocity(type.speedx * vx, type.speedy * vy);
    }
  }

  bindEvents(meteor) {
    // meteor.on('hit-by-bullet', () => {
    //   meteor.hp -= 1;
    //   if (meteor.hp <= 0) {
    //     this.meteors.killAndHide(meteor);
    //     // spawn another?
    //     if (meteor.type === MeteorTypes.BIG) {
    //       this.spawn(MeteorTypes.MEDIUM, meteor.x, meteor.y, meteor.vx, meteor.vy);
    //       this.spawn(MeteorTypes.MEDIUM, meteor.x, meteor.y, -meteor.vx, -meteor.vy);
    //     } else if (meteor.type === MeteorTypes.MEDIUM) {
    //       this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, meteor.vx, meteor.vy);
    //       this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, -meteor.vx, -meteor.vy);
    //       this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, -meteor.vx, meteor.vy);
    //       this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, meteor.vx, -meteor.vy);
    //     }
    //   } else {
    //     // hit explosions
    //     this.scene.events.emit('explosion', {
    //       x: meteor.x, y: meteor.y, scale: 0.2
    //     });
    //   }
    // });
    meteor.on('hit-by-explosion', () => {
      // hit explosions
      this.scene.events.emit('explosion', {
        x: meteor.x, y: meteor.y, scale: 0.2
      });
      this.meteors.killAndHide(meteor);
      // spawn another?
      if (meteor.type === MeteorTypes.BIG) {
        this.spawn(MeteorTypes.MEDIUM, meteor.x, meteor.y, meteor.vx, meteor.vy);
        this.spawn(MeteorTypes.MEDIUM, meteor.x, meteor.y, -meteor.vx, -meteor.vy);
      } else if (meteor.type === MeteorTypes.MEDIUM) {
        this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, meteor.vx, meteor.vy);
        this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, -meteor.vx, -meteor.vy);
        this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, -meteor.vx, meteor.vy);
        this.spawn(MeteorTypes.SMALL, meteor.x, meteor.y, meteor.vx, -meteor.vy);
      }
    });
  }

  update(time, delta, ship) {
    const children = this.meteors.getChildren();

    for (const m of children) {
      if (m.active) {
        m.angle += m.type.rotSpeed;

        if (!this.config.noWrap) {
          this.scene.physics.world.wrap(m, m.width);
        }
      }
    }

    if (ship.active) {
      this.scene.physics.overlap(ship, children, (ship, meteor) => 
        ship.emit('hit-by-meteor', meteor, Globals.damage.meteor));
    }
  }

}

export { Meteors, MeteorTypes };
