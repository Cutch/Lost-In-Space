const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, './'),
    compress: true,
    port: 9000
  },
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'bundle.js'
  }
};
