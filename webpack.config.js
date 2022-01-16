const path = require("path");

module.exports = {
  mode: 'development',
  entry: ["regenerator-runtime/runtime.js", "./src/js/index.js"],
  output: {
    path: path.resolve(__dirname, "public/js"),
    filename: "bundle.js"
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};
