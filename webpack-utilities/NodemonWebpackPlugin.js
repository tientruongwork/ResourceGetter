const nodemon = require("nodemon");

class NodemonWebpackPlugin {
    constructor(isNodemonRunning = false) {
        this.isNodemonRunning = isNodemonRunning;
    }

    apply(compiler) {
        compiler.hooks.done.tap("NodemonWebpackPlugin", (ddd) => {
            if (!this.isNodemonRunning) {
                nodemon({
                    watch: ["./build"],
                }).on("restart", () => {
                    console.log("Application restarted");
                });

                this.isNodemonRunning = true;
            }
        });
    }
}

module.exports = { NodemonWebpackPlugin };