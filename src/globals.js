// globals.js - global game switches and consts

const checkStringBoolean = (item) => item === `true`;

const URLOptions = {};
window.location.search.slice(1).split('&').map((option) => {
  const keyValue = option.split('=');
  URLOptions[keyValue[0]] = checkStringBoolean(keyValue[1]) || keyValue[1];
});

const Globals = {
  // misc
  bitmapFont: 'standard',
  atlas1: 'atlas-k',
  atlas_px: 'atlas-px',
  atlas_regular: 'atlas-reg',
  atlas_simple: 'atlas-simple',
  palette: {
    pacman: {
      body: 0xffff00
    },
    ghost1: {
      body: 0x00ffde,
      eyes: 0xffffff,
    },
    ghost2: {
      body: 0xff0000,
      eyes: 0x010101,
    },
    ghost3: {
      body: 0xffb8de,
      eyes: 0xffffff,
    },
    ghost4: {
      body: 0xffb847,
      eyes: 0xff0000,
    }
  },
  // development
  debug: checkStringBoolean(localStorage.getItem(`debug`)),
  debugPhysics: checkStringBoolean(localStorage.getItem(`debugPhysics`)),
  showFPS: checkStringBoolean(localStorage.getItem(`showFPS`)),
  noSounds: checkStringBoolean(localStorage.getItem(`noSounds`)),
  noMusic: checkStringBoolean(localStorage.getItem(`noMusic`)),
  // maybe add dev-* key to items' names so we can cycle through options
  // list and assign values automatically
  ...URLOptions, // url options override localSotrage values
};

export default Globals;
