import kontra from 'rollup-plugin-kontra';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

function replaceStrings(options = {}) {
  return {
    name: 'replace-strings',
    renderChunk(code, chunk, outputOptions) {
      /**
       * Make simple string replaces for minimization
       */
      if (code.match(/window\.addEventListener/)) {
        code = 'const _a=window.addEventListener;' + code.replace(/window\.addEventListener/g, '_a');
      }
      if (code.match(/Math/)) {
        code = 'const _m=Math;' + code.replace(/Math/g, '_m');
      }
      if (code.match(/rotation/)) {
        code = code.replace(/rotation/g, '_r');
      }
      // if (code.match(/width/)) {
      //   code = code.replace(/width/g, '_w');
      // }
      // if (code.match(/height/)) {
      //   code = code.replace(/height/g, '_h');
      // }

      if (code.match(/setTimeout/)) {
        code = 'const _s=setTimeout;' + code.replace(/setTimeout/g, '_s');
      }
      if (code.match(/lineHeight/)) {
        code = code.replace(/lineHeight/g, 'lh');
      }
      if (code.match(/context/)) {
        code = code.replace(/context/g, '_c');
      }
      // if (code.match(/textAlign/)) {
      //   code = code.replace(/textAlign/g, 'aa');
      // }
      // if (code.match(/\.canvas/) && code.match(/canvas:/)) {
      //   code = code.replace(/\.canvas/g, '._d').replace(/canvas:/g, '_d:');
      // }

      /**
       * Generate a list of duplicated text and store them in a json object
       */
      const matches = code.match(/[a-zA-Z]+:"[^"]+"/gm);

      const replaceCount = matches
        .map(x => x.split(':')[1])
        .reduce((t, match) => {
          t[match] = (t[match] || 0) + 1;
          return t;
        }, {});
      let alphaI = 0;
      const alphabet = [];
      const getNextVar = () => {
        // const n = Math.ceil(alphaI / alphabet.length);
        const text = alphabet[alphaI];
        // for (let i = 0; i < n; i++) {
        //   text += alphabet[alphaI];
        // }
        alphaI++;
        return text;
      };
      for (let i = 97; i <= 122; i++) alphabet.push(String.fromCharCode(i));
      for (let i = 65; i <= 90; i++) alphabet.push(String.fromCharCode(i));
      const textDict = {};
      Object.keys(replaceCount).forEach(key => {
        if (replaceCount[key] > 1) {
          if (key.length > 2) {
            const newVar = getNextVar();
            textDict[newVar] = key.replace(/"/g, '');
            code = code.replace(new RegExp(key, 'g'), `_t.${newVar}`);
          }
        }
      });
      // const newVar = getNextVar();
      // textDict[newVar] = 'textAlign';
      // code = code.replace(new RegExp('textAlign:', 'g'), `(_t.${newVar}):`);
      code = `const _t=${JSON.stringify(textDict)};${code}`;

      return 'function lis(){' + code + '};lis();';
    }
  };
}

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/bundle.js'
      }
    ],
    plugins: [
      resolve(), // so Rollup can find `ms`
      kontra({
        gameObject: {
          velocity: true,
          rotation: true,
          anchor: true
        },
        // vector: {
        // enable vector length functionality
        // length: true
        // },
        text: { textAlign: true }
      }),
      bundleSize()
    ]
  },
  {
    input: 'dist/bundle.js',
    output: [
      {
        file: 'dist/bundle.min.js',
        plugins: [
          terser({
            toplevel: true,
            mangle: {
              module: true,
              properties: {
                keep_quoted: true
              },
              toplevel: true
            },
            compress: {
              passes: 1,
              booleans_as_integers: true,
              // arguments: true,
              module: true,
              toplevel: true,
              ecma: 6
              // hoist_funs: true,
              // hoist_vars: true
            },
            module: true,
            ecma: 2016
          }),
          replaceStrings(),
          bundleSize()
          // bundleSize()
        ]
      }
    ]
  }
];
