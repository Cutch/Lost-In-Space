import kontra from 'rollup-plugin-kontra';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

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
              properties: true,
              toplevel: true
            },
            compress: {
              passes: 2,
              booleans_as_integers: true,
              arguments: true,
              module: true,
              toplevel: true
            },
            module: true,
            ecma: 2016
          }),
          bundleSize()
        ]
      }
    ]
  }
];
