const path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    filename: 'window.build.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget:'window'
  },
  mode:"development"
};