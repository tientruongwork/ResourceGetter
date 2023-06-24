const path = require("path");

const nodeExternals = require("webpack-node-externals");
const CleanTerminalWebpackPlugin = require("clean-terminal-webpack-plugin");
const { NodemonWebpackPlugin } = require("./webpack-utilities/NodemonWebpackPlugin");
const resolveTsconfigPathsToAlias = require('./webpack-utilities/resolve-tsconfig-paths-to-alias');

delete process.env.TS_NODE_PROJECT
console.log(path.join(__dirname, "./tsconfig.json"))
module.exports = {
    entry: {
        main: "./src/app.ts",
    },
    mode: process.env.NODE_ENV || "development",
    target: "node",
    devtool: "inline-source-map",
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: resolveTsconfigPathsToAlias(__dirname),
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "build"),
    },
    plugins: [
        new NodemonWebpackPlugin(),
        new CleanTerminalWebpackPlugin(),
    ],
};