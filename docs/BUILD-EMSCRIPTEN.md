# Build PHP for Cloudflare Workers (Single-thread Emscripten)

Cloudflare Workers 不提供浏览器 Web Worker/SharedArrayBuffer。
任何启用 `USE_PTHREADS=1` 或 `PROXY_TO_PTHREAD=1` 的 Emscripten 构建都会在初始化阶段卡死，`onRuntimeInitialized` 永不触发。

请按以下要点生成"单线程"构建的 `php_8_4.js` 与 `php_8_4.wasm`：

- 禁用线程
  - `-s USE_PTHREADS=0`
  - `-s PROXY_TO_PTHREAD=0`
- Worker 环境
  - `-s ENVIRONMENT=worker`
- 输出形式（ESM + 工厂）
  - `-s MODULARIZE=1 -s EXPORT_ES6=1`
- 内存
  - `-s ALLOW_MEMORY_GROWTH=1`
  - 可选：`-s INITIAL_MEMORY=268435456`
- 文件系统（如需）
  - `-s FILESYSTEM=1`
- 调试（可选）
  - `-s ASSERTIONS=1`（便于定位 glue 报错）
- 其他常见设置（视项目而定）
  - `-s AUTO_JS_LIBRARIES=0`
  - `-s SUPPORT_LONGJMP=0`
  - `-s LLD_REPORT_UNDEFINED=1`

快速自检（避免误上"线程版"）：
- 在生成的 glue（`php_8_4.js`）中不要出现这些特征：
  - `PThread`, `proxyToWorker`, `Atomics.wait`, `SharedArrayBuffer`
- 在 Workers 内不应请求 `pthread-main.js` 或创建 `new Worker(...)`
- 运行时不应依赖 `crossOriginIsolated`

部署建议：
- 保留"探针路由"（`/__probe` 等）以便快速确认 import.meta 与 wasm 可达性。
- Glue 顶层可能读取 `location.href` 或 `self`，建议在 Worker 入口 import 前加最小 polyfill（本仓库已有示例）。
- ESM Worker 不需要 `wasm_modules` 配置；如果后续切回执行版，可以：
  - 直接 `import "../scripts/php_8_4.wasm"`，让 Wrangler 产出 `WebAssembly.Module`，通过 `instantiateWasm` 同步实例化；
  - 或使用 `wasmBinary` 作为兜底（非 Cloudflare 环境）。

更换为"单线程"产物后：
- 将新产物覆盖到 `scripts/php_8_4.js` 与 `scripts/php_8_4.wasm`
- 将入口从"探针版"改回执行版（我可提供对应补丁或提交 PR）