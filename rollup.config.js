import kontra from 'rollup-plugin-kontra';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';

function replaceStrings(options = {}) {
  return {
    name: 'replace-strings',
    renderChunk(code, chunk, outputOptions) {
      const alphaI = {};
      const alphabet = [];
      // const range = to => [...Array(to).keys()];
      for (let i = 97; i <= 122; i++) alphabet.push(String.fromCharCode(i));
      for (let i = 65; i <= 90; i++) alphabet.push(String.fromCharCode(i));
      const getNextVar = id => {
        // const n = Math.ceil(alphaI / alphabet.length);
        const i = alphaI[id] || 0;
        const text = alphabet[i];
        // for (let i = 0; i < n; i++) {
        //   text += alphabet[alphaI];
        // }
        alphaI[id] = i + 1;
        // console.log(text);
        return text;
      };
      /**
       * Make simple string replaces for minimization
       */
      if (code.match(/window\.addEventListener/)) {
        code = 'const _a=window.addEventListener;' + code.replace(/window\.addEventListener/g, '_a');
      }
      if (code.match(/document/)) {
        code = 'const _d=document;' + code.replace(/document/g, '_d');
      }

      if (code.match(/Math/)) {
        code = code.replace(/Math/g, '_m');

        const replaceMathFunctions = value => {
          const matches = code.match(new RegExp(`_m.${value}`, 'g'));
          if (matches) {
            const matchesCount = matches.length;
            const worthIt = matchesCount * value.length - matchesCount * 2 - 13 - value.length;
            if (worthIt > 0) {
              const newVar = 'X' + getNextVar(1);
              code = code.replace(new RegExp(`_m\\.${value}`, 'gm'), `${newVar}`);
              code = `const ${newVar}=_m.${value};` + code.replace(/Math/g, '_m');
            }
          }
        };
        code
          .match(/_m.[a-zA-Z]+/gm)
          .map(x => x.slice(3))
          .filter((x, i, a) => a.indexOf(x) === i)
          .forEach(replaceMathFunctions);
        code = 'const _m=Math;' + code;
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
      const textDict = {};
      Object.keys(replaceCount).forEach(key => {
        if (replaceCount[key] > 1) {
          if (key.length > 2) {
            const newVar = getNextVar(2);
            textDict[newVar] = key.replace(/"/g, '');
            code = code.replace(new RegExp(key, 'g'), `_t.${newVar}`);
          }
        }
      });
      const replaceDotVars = value => {
        const matches = code.match(new RegExp(`\\.${value}`, 'g'));
        if (matches) {
          const matchesCount = matches.length;
          const worthIt = matchesCount * (value.length + 1) - matchesCount * 6 - 7 - value.length;
          if (worthIt > 0) {
            const newVar = getNextVar(2);
            textDict[newVar] = value;
            code = code.replace(new RegExp(`\\.${value}`, 'gm'), `[_t.${newVar}]`);
          }
        }
      };
      code
        .match(/\.[a-zA-Z0-9]+/gm)
        .map(x => x.slice(1))
        .filter((x, i, a) => a.indexOf(x) === i)
        .forEach(replaceDotVars);

      code = `const _t=${JSON.stringify(textDict)};${code}`;
      // Comment in to wrap in function for variable safety
      code = code.replace(`,ArrowLeft:"left",ArrowUp:"up",ArrowRight:_t.a,ArrowDown:"down"`, '');
      code = code.replace(`Escape:"esc",`, '');

      // const compressedCode = code
      //   .split(/|/)
      //   .map(x => x.charCodeAt(0))
      //   .reduce(
      //     (p, c, i, arr) => {
      //       if (i % 32 === 31 || i === arr.length - 1) {
      //         p.code += String.fromCharCode(p.char | (c << i % 32));
      //         p.char = 0;
      //       } else {
      //         p.char |= c << i % 32;
      //       }
      //       return p;
      //     },
      //     { code: '', char: 0 }
      //   ).code;

      // console.log(
      //   compressedCode
      //     .split(/|/)
      //     .reduce((t, x, i) => {
      //       const code = x.charCodeAt(0);
      //       return [
      //         ...t,
      //         ...range(32).map(n => {
      //           code >> n;
      //         })
      //       ];
      //     }, [])
      //     .join('')
      // );

      code = 'function lis(){' + code + '};lis();';
      const content = fs.readFileSync('template.html', 'utf8');
      const bodyI = content.indexOf('</body>');
      if (bodyI == -1) console.error('Missing body in template.html');
      else {
        const html = content.slice(0, bodyI) + `<script>${code}</script>` + content.slice(bodyI);
        console.log('Bundle Bytes: ', html.length, html.length <= 13312 ? 'Under 13KB' : 'Above 13KB');
        fs.writeFileSync('index.html', html, 'utf8');
      }

      return code;
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
      resolve(),
      kontra({
        gameObject: {
          velocity: true,
          rotation: true,
          anchor: true
        },
        text: { textAlign: true }
      })
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
              module: true,
              toplevel: true,
              ecma: 6
            },
            module: true,
            ecma: 2016
          }),
          replaceStrings()
        ]
      }
    ]
  }
];
