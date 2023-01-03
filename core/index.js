const Compiler = require("../compiler.js");

function webpack(options) {
    // 创建 compiler 对象
    const compiler = new Compiler(options);
    compiler.run((code) => { console.log(code); });
}

module.exports = webpack;