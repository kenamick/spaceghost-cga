// audio.js - handles all user input
import { Math } from 'phaser';
import Globals from './globals';

const DEFAULT_FADE_INOUT = 2000;

const ASSETS = {
  'menu-select': {
    files: ['tkp_menu_select.ogg']
  },
  'menu-tap': {
    files: ['tkp_menu_tap.ogg']
  },
  'music-menu': {
    files: ['muzik_cutmywings.ogg']
  },
  'music-game1': {
    files: ['muzik_starwalker.ogg']
  },
  'ship-laser': {
    files: ['tkp_laser_1.ogg']
  },
  'explosions': {
    files: ['tkp_explosion_1_2.ogg', 'tkp_explosion_1_5.ogg']
  },
  'shields': {
    files: ['tkp_shields_1.ogg', 'tkp_shields_2.ogg', 'tkp_shields_3.ogg']
  },
  'ignite': {
    files: ['tkp_pacignite_1.ogg']
  },
  'pacman-eats': {
    files: ['tkp_pacman_eats_1.ogg']
  },
  'ship-thrust': {
    files: ['tkp_ship_thrust_1.ogg'],
    // loops issue
    // http://www.html5gamedevs.com/topic/19711-seamless-audio-loops-in-phaser/
  }
};

let _currentMusic = null;

class Audio {

  static load(scene) {
    Object.keys(ASSETS).map(key => {
      let i = 1;
      for (const f of ASSETS[key].files) {
        scene.load.audio(key + i, require(`../assets/audio/${f}`));
        i++;
      }
    });
  }

  constructor(scene) {
    this.scene = scene;

    this.sounds = {};

    Object.keys(ASSETS).map(key => {
      this.sounds[key] = [];
      let i = 1;
      for (const f of ASSETS[key].files) {
        const name = key + i;
        this.sounds[key].push(scene.sound.add(name));
        i++;
      }
    });

    this._soundsOn = Globals.noSounds == false;
    this._musicOn = Globals.noMusic == false;

    // _currentMusic = null;
  }

  _canPlay(audio) {
    if (!audio)
      return true;

    if (audio && audio.name in this.musics) {
      return this._musicOn;
    }

    return this._soundsOn;
  }

  playSound(name, config) {
    if (!this._soundsOn) {
      return;
    }

    if (config) {
      if (config.modal) {

        let idx = 0;
        if (config.idx) {
          idx = config.idx;
        } else if (config.random) {
          idx = Math.Between(0, this.sounds[name].length - 1);
        }

        let snd = this.sounds[name][idx];
        if (!snd.isPlaying) {
          this.sounds[name][idx].play(config);
        }

        return;

      } else if (config.idx) {
        this.scene.sound.play(`${name}${config.idx}`, config);
      } else if (config.random) {
        const idx = Math.Between(1, this.sounds[name].length);
        this.scene.sound.play(`${name}${idx}`, config);
      }
    } else {
      this.scene.sound.play(`${name}1`, config);
    }
  }

  setSoundVol(name, vol) {
    if (!this._soundsOn) {
      return;
    }

    if (name) {
      this.sounds[name][0].setVolume(vol);
    }
  }

  isMusicPlaying(name) {
    if (!this._musicOn) {
      return;
    }

    if (name) {
      return this.sounds[name][0].isPlaying;
    } else {
      return _currentMusic.isPlaying;
    }
  }

  playMusic(name, config) {
    if (!this._musicOn) {
      return;
    }

    _currentMusic = this.sounds[name][0];
    if (config && config.loop) {
      _currentMusic.play({ loop: config.loop });
    }
  }

  stop(name = null) {
    // if (!this._musicOn) {
    //   return;
    // }

    if (name) {
      this.sounds[name][0].stop();
    } else {
      _currentMusic.stop();
      this.scene.sound.stopAll();
    }
  }

  fadeIn(cb, config) {
    if (!this._musicOn) {
      cb && cb();
      return;
    }

    //_currentMusic.volume = 0;

    let duration = DEFAULT_FADE_INOUT
    let maxVol = 1

    if (config) {
      duration = config.duration || duration;
      maxVol = config.maxVol || maxVol;
    }

    this.scene.tweens.add({
      targets: _currentMusic,
      volume: maxVol,
      ease: 'Linear',
      duration: duration,
      onComplete: () => cb && cb()
    });
  }

  fadeOut(cb, config) {
    if (!this._musicOn) {
      cb && cb();
      return;
    }

    let duration = DEFAULT_FADE_INOUT
    if (config && config.duration) {
      duration = config.duration
    }

    this.scene.tweens.add({
      targets: _currentMusic,
      volume: 0,
      ease: 'Linear',
      duration: duration,
      onComplete: cb
    });
  }

  setMusicVol(name, vol) {
    if (this._musicOn) {
      this.sounds[name][0].volume = vol;
    }
  }

  set soundsOn(value) {
    this._soundsOn = value;
    localStorage.setItem(`noSounds`, !value);
  }
  get soundsOn() {
    return this._soundsOn;
  }
  set musicOn(value) {
    this._musicOn = value;
    localStorage.setItem(`noMusic`, !value);
  }
  get musicOn() {
    return this._musicOn;
  }
}

export default Audio;
