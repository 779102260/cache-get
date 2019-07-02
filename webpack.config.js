const path = require("path"); 

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'cache-get.js',
    path: path.resolve(__dirname, './dist'),
    library: 'cacheGet',
    libraryTarget: 'umd'
  },
  externals: {
    'axios':'axios'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
    }]
  }
}