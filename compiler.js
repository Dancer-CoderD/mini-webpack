const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const generator = require("@babel/generator");
const t = require("@babel/types");

class Compiler {
    constructor(options) {
        this.options = options || {};

        // 保存编译过程编译的 module
        this.modules = new Set();
    }

    run(callback) {
        const entryModule = this.build(path.join(process.cwd(), this.options.entry));
        const entryChunk = this.buildChunk("entry", entryModule);
        this.generateFile(entryChunk, callback);
    }

    build(modulePath) {
        let originCode = fs.readFileSync(modulePath);
        originCode = this.dealWithLoader(modulePath, originCode.toString());
        
        return this.dealDependencies(originCode, modulePath);
    }

    // 将源码交给匹配的 loader 处理
    dealWithLoader(modulePath, originCode) {
        [...this.options.module.rules].reverse().forEach(item => {
            if (item.test(modulePath)) {
                const loaders = [...item.use].reverse();
                loaders.forEach(loader => originCode = loader(originCode));
            }
        })

        return originCode;
    }

    // 调用 webpack 处理依赖的代码
    dealDependencies(code, modulePath) {
        const fullPath = path.relative(process.cwd(), modulePath);
        // 创建模块对象
        const module = {
            id: fullPath,
            dependencies: [] // 该模块所依赖模块绝对路径地址
        };

        // 处理 require 语句，同时记录依赖了哪些文件
        const ast = parser.parse(code, {
            sourceType: "module",
            ast: true
        });

        // 深度优先 遍历语法 Tree
        traverse.default(ast, {
            CallExpression: (nodePath) => {
                const node = nodePath.node;
                if (node.callee.name === "require") {
                    // 获得依赖路径
                    const requirePath = node.arguments[0].value;

                    const moduleDirName = path.dirname(modulePath);
                    const fullPath = path.relative(path.join(moduleDirName, requirePath), requirePath);

                    // 替换 require 语句为 webpack 自定义的 require 方法
                    node.callee = t.identifier("__webpack_require__");
                    // 将依赖路径修改成以当前路径为基准
                    node.arguments = [t.stringLiteral(fullPath)];

                    const exitModule = [...this.modules].find(item => item.id === fullPath);
                    // 该文件可能被处理过，这里判断一下
                    if (!exitModule) {
                        // 记录下当前处理的文件所依赖的文件（后续需逐一处理）
                        module.dependencies.push(fullPath);
                    }
                }
            }
        });

        // 根据新的 ast 生成代码
        const { code: compilerCode } = generator.default(ast);
        // 保存处理后的代码
        module._source_ = compilerCode;

        // 需递归处理依赖的依赖
        module.dependencies.forEach(dependency => {
            const depModule = this.build(dependency);
            this.modules.add(depModule);
        })

        // 返回当前模块对象
        return module;
    }

    buildChunk(entryName, entryModule) {
        return {
            name: entryName,
            // 入口文件编译结果
            entryModule: entryModule,
            // 所有直接依赖和简介依赖编译结果
            modules: this.modules
        }
    }

    generateFile(entryChunk, callback) {
        // 获取打包后的代码
        const code = this.getCode(entryChunk);
        callback && callback(code);

        if (!fs.existsSync(this.options.output.path)) {
            fs.mkdirSync(this.options.output.path);
        }

        // 写入文件
        fs.writeFileSync(
            path.join(
                this.options.output.path,
                this.options.output.filename.replace("[name]", entryChunk.name)
            ),
            code
        )
    }

    getCode(entryChunk) {
        return `
            (() => {
                // webpackBootstrap
                var __webpack_modules__ = {
                    ${entryChunk.modules.map(module => `
                        "${module.id}": (module, __unused_webpack_exports, __webpack_require__) => {
                            ${module._source}
                        }
                    `).join(',')}
                };

                var __webpack_module_cache__ = {};

                function __webpack_require__(moduleId) {
                    // Check if module is in cache
                    var cachedModule = __webpack_module_cache__[moduleId];
                    if (cachedModule !== undefined) {
                        return cachedModule.exports;
                    }
                    // Create a new module (and put it in the cache)
                    var module = (__webpack_module_cache__[moduleId] = {
                        exports: {}
                    });

                    // Execute the module 
                    function __webpack_modules__[moduleId](
                        module,
                        module.exports.
                        __webpack_require__
                    );

                    // Return the exports of the module
                    return module.exports;
                }

                var __webpack_exports__ = {};
                // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
                (() => {
                    ${entryChunk.entryModule._source};
                })();
            })()
        `;
    }
}

module.exports = Compiler;