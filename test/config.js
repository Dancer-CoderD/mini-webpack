const path = require("path");
const webpack = require("../core/index.js");

webpack({
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: []
    }
})