const path = require('path');
const webpack = require('webpack');

const VERBOSE = process.argv.includes('--verbose');

module.exports = {
  plugins: [new webpack.optimize.AggressiveMergingPlugin()],
  
  entry : {
    index : ["./src/ts/popup/index.tsx", "./src/scss/app.scss"]
  },

  output: {
    publicPath: '/',
    sourcePrefix: '',
    path: __dirname + "/dest",
    filename: '[name].js',
    libraryTarget: "umd"
  },

  target: "web",

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  
  devtool : 'inline-source-map',

  devServer: {
    contentBase: path.join(__dirname, "dest"),
    compress: true,
    port: 9000
  },

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
        loaders : "ts-loader",
        exclude : [/node_modules/, "./lib"],
        include : [__dirname + "/src/ts"]
      },
      
      {
        test : /\.scss$/,
        loaders : ["style-loader", "css-loader", "sass-loader"],
        include : __dirname + "/src/scss"
      }
    ]
  }
};
