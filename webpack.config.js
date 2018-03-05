const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {presets:['es2015', 'react', 'env', 'stage-2']}
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader?limit=100000',
        },
    ],
  },
};