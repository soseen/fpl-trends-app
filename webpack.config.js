import path from "path";

import Dotenv from "dotenv-webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

export default {
  entry: "./src/index.js",
  mode: "development",
  output: {
    path: path.resolve(process.cwd(), "dist"),
    filename: "index_bundle.js",
  },

  target: "web",
  devServer: {
    port: "5000",
    static: {
      directory: path.join(process.cwd(), "public"),
    },
    open: true,
    hot: true,
    liveReload: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(process.cwd(), "@"),
      src: path.resolve(process.cwd(), "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(process.cwd(), "public", "index.html"),
    }),
    new Dotenv(),
  ],
};
