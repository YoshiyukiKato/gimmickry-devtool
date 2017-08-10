const path = require('path');
const webpack = require('webpack');

const VERBOSE = process.argv.includes('--verbose');

module.exports = {
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  
  entry : {
    "index" : ["./src/ts/popup/index.tsx", "./src/scss/app.scss"],
    "js/content_scripts/init" : ["./src/ts/content_scripts/init.ts"]
  },

  output: {
    publicPath: '/',
    sourcePrefix: '',
    path: __dirname + "/dest/",
    filename: '[name].js',
    libraryTarget: "umd"
  },

  target: "web",

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  
  devtool : 'inline-source-map',

  module : {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        loader : 'babel-loader',
        exclude : /node_modules/,
        include : __dirname + "/src/js"
      },
      
      {
        test: /\.(ts|tsx)?$/,
        loader : ["babel-loader", "ts-loader"],
        include : [__dirname + "/src/ts", __dirname + "/lib"],
        exclude : [/node_modules/, __dirname + "/lib/**/test"]
      },
      
      {
        test : /\.scss$/,
        loaders : ["style-loader", "css-loader", "sass-loader"],
        include : __dirname + "/src/scss"
      }
    ]
  }
};
