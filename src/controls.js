// controls.js - handles all user input

import Globals from './globals';

const stickThreshold = 0.1;

class Controls {

  constructor(game, justPressed = false) {
    this.game = game;
    // This might need a better way of being passed to the class!
    this.justPressed = justPressed;

    if (game.input.gamepad) {
      this.pad1 = game.input.gamepad.pad;
    }

    // add all possible keyboard inputs
    this.keys = {
      ups: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
      ],
      downs: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
      ],
      lefts: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
      ],
      rights: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      ],
      action1: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      ],
      action2: [
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y),
        game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
        // game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      ]
    };

    // allow for testing game stuff
    // these should be disabled in production builds
    if (Globals.debug) {
      this.keys = {
        ...this.keys,
        killAll: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
        killNearby: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
        killVisible: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
        warpAtEnd: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
        hurtHero: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
        healHero: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
        showDialog: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        makeRain: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      };
    }
  }

  _keyPressed(keys) {
    for (const k of keys) {

      if (this.justPressed) {
        if (Phaser.Input.Keyboard.JustUp(k))
          return true;
      } else {
        if (k.isDown) {
          return true;
        }
      }

    }
    return false;
  }

  _padPressed(button) {
    if (this.justPressed) {
      return this.pad1.justPressed(button, 25);
    }

    return this.pad1.isDown(button);
  }

  _stickMoved(isAxisOverTreshold) {
    if (this.justPressed) {
      return false;
    }

    return isAxisOverTreshold;
  }

  get up() {
    return this._keyPressed(this.keys.ups);
    // return (
    //   this._keyPressed(this.keys.ups) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_DPAD_UP) ||
    //   this._stickMoved(
    //     this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -stickThreshold
    //   )
    // );
  }

  get down() {
    return this._keyPressed(this.keys.downs);
    // return (
    //   this._keyPressed(this.keys.downs) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_DPAD_DOWN) ||
    //   this._stickMoved(
    //     this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > stickThreshold
    //   )
    // );
  }

  get left() {
    return this._keyPressed(this.keys.lefts);
    // return (
    //   this._keyPressed(this.keys.lefts) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_DPAD_LEFT) ||
    //   this._stickMoved(
    //     this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -stickThreshold
    //   )
    // );
  }

  get right() {
    return this._keyPressed(this.keys.rights);
    // return (
    //   this._keyPressed(this.keys.rights) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_DPAD_RIGHT) ||
    //   this._stickMoved(
    //     this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > stickThreshold
    //   )
    // );
  }

  get action1() {
    return this._keyPressed(this.keys.action1);
    // return (
    //   this._keyPressed(this.keys.kicks) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_A)
    // );
  }

  get action2() {
    return this._keyPressed(this.keys.action2);
    // return (
    //   this._keyPressed(this.keys.kicks) ||
    //   this._padPressed(Phaser.Gamepad.XBOX360_A)
    // );
  }

  // DEBUG

  debug(what) {
    return this.keys[what].justPressed();
  }

}

export default Controls;
