// 极简 asyncify 8.4 版本，仅导出 asyncify/8_4_10/php_8_4.js 的默认工厂函数。
// 注意：需配合 package.json/main 指向此文件，并且确保只保留 asyncify/8_4_10/php_8_4.js 及相关 wasm/dat 文件。

const phpWasmAsyncify84 = require('./php/asyncify/8_4_10/php_8_4.js');

module.exports = phpWasmAsyncify84;
