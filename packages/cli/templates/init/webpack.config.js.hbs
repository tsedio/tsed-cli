const webpack = require('webpack')
const path = require('path')

const { NODE_ENV = 'development' } = process.env
const isProduction = NODE_ENV !== 'development'
const packages = require('./package.json')

module.exports = {
  target: 'node',
  devtool: false,

  externals: [
    ...Object.keys(packages.dependencies || {})
  ],

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV,
      WEBPACK_ENV: true
    }),
    !isProduction && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean),

  entry: [
    !isProduction && 'webpack/hot/poll?1000',
    path.resolve(path.join(__dirname, './src/index'))
  ].filter(Boolean),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
    libraryTarget: 'commonjs2'
  },

  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
    modules: [
      path.join(__dirname, '..', 'src'),
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true,
          cacheDirectory: true
        }
      }
    ]
  },

  node: {
    global: false,
    __filename: false,
    __dirname: false
  }
}


