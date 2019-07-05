const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/widget.tsx",
    output: {
        filename: "widget.js",
        path: path.resolve(__dirname, "dist"),
        library: "BreezeWidget",
        libraryTarget: "var",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.tsx?$/,
                loader: "babel-loader",
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
            },
        ],
    },
    devServer: {
        contentBase: "./dist",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [new CopyPlugin([{ from: "src/index.html", to: "." }])],
};
