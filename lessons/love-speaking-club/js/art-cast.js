/* Fluent English - Love Speaking Club
 * art-cast.js : the recurring characters (all fictional adults). Alex has the requested masculine adult design:
 * broad shoulders, defined jaw, short textured hair, neat stubble, structured casual overshirt, grounded posture. */
(function (global) {
  'use strict';
  const { PAL } = global.Art;
  const SPEC = {
    alex: { name: 'Alex', build: 'male', skin: 's2', hair: 'short', hairColor: '#2A1E1C', beard: 'stubble', watch: true,
      outfit: { tee: '#F3E7D0', neck: 'henley', jacket: '#3B5BA5', sleeve: 'rolled', pockets: true, texture: 'weave', pants: '#2b2f45' } },
    maya: { name: 'Maya', build: 'female', skin: 's3', hair: 'wavy', hairColor: '#1E1417', earrings: true, bracelet: true,
      outfit: { tee: '#FBF4E6', neck: 'scoop', jacket: '#1B8F8A', sleeve: 'long', texture: 'knit', edge: 16, pants: '#3a2a3f' } },
    priya: { name: 'Priya', build: 'female', skin: 's4', hair: 'bun', hairColor: '#17101a', earrings: true,
      outfit: { tee: '#E6A93A', neck: 'v', sleeve: 'long', pants: '#26314F' } },
    leo: { name: 'Leo', build: 'male', skin: 's1', hair: 'curly', hairColor: '#6a3420', beard: 'stubble', beardColor: '#6a3420',
      outfit: { tee: '#FBF4E6', neck: 'crew', jacket: '#FF6B57', sleeve: 'rolled', collar: false, texture: 'weave', pants: '#2b2f45' } },
    sam: { name: 'Sam', build: 'male', skin: 's1', hair: 'bald', hairColor: '#d6d6dc', beard: 'full', beardColor: '#e0e0e6', glasses: true, armHair: false,
      outfit: { tee: '#8c2f3e', neck: 'crew', sleeve: 'long', texture: 'knit', pants: '#3a3a4a' } },
    nora: { name: 'Nora', build: 'female', skin: 's2', hair: 'bob', hairColor: '#c9ccd6', hairHi: '#ffffff', earrings: true, glasses: true, glassColor: '#B5214F',
      outfit: { tee: '#FBF4E6', neck: 'scoop', jacket: '#B5214F', sleeve: 'long', texture: 'knit', edge: 16, pants: '#3a3a4a' } },
    dev: { name: 'Dev', build: 'male', skin: 's3', hair: 'slick', hairColor: '#1b1514', beard: 'stubble',
      outfit: { tee: '#1FA8A0', neck: 'crew', jacket: '#14224A', sleeve: 'long', texture: 'weave', pants: '#2b2f45' } }
  };
  global.Art.Cast = {
    SPEC,
    make(id, over) {
      const sp = Object.assign({}, SPEC[id], over || {});
      const fg = global.Art.makeFigure(sp); fg.castId = id; return fg;
    }
  };
})(window);
