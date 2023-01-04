
            (() => {
                // webpackBootstrap
                var __webpack_modules__ = {
                    
                        "test\b.js": (module, __unused_webpack_exports, __webpack_require__) => {
                            console.log("b load");
const b = 1;
module.exports = b;
                        }
                    ,
                        "test\a.js": (module, __unused_webpack_exports, __webpack_require__) => {
                            const b = __webpack_require__("E:\\handlework\\study\\project\\mini-webpack\\test\\b.js");
const a = 1;
console.log("a load");
module.exports = a;
                        }
                    
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

                    // Execute the module function
                    __webpack_modules__[moduleId](
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
                    const a = __webpack_require__("E:\\handlework\\study\\project\\mini-webpack\\test\\a.js");
console.log("entry load");;
                })();
            })()
        