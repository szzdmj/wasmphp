# Build PHP for Cloudflare Workers (Single-thread, no pthreads)

Cloudflare Workers 不提供浏览器 Web Worker/SharedArrayBuffer。任何启用 `USE_PTHREADS=1` 或 `PROXY_TO_PTHREAD=1` 的 Emscripten 构建都会在初始化阶段卡死，`onRuntimeInitialized` 永不触发。

本仓库提供 GitHub Actions 工作流，在线（CI）构建“单线程” Wasm 产物（`scripts/php_8_4.js/.wasm`），Worker 直接加载运行。

## 关键编译设置（已写入 Dockerfile/脚本）

- 禁用线程：
  - `-s USE_PTHREADS=0`
  - `-s PROXY_TO_PTHREAD=0`
- Worker 环境：
  - `-s ENVIRONMENT=worker`
- 模块输出（ES6）：
  - `-s MODULARIZE=1 -s EXPORT_ES6=1`
- 内存：
  - `-s ALLOW_MEMORY_GROWTH=1`
  - 可选：`-s INITIAL_MEMORY=268435456`
- 文件系统（如需）：
  - `-s FILESYSTEM=1`

> 我们在 Worker 内通过 `instantiateWasm(imports, successCallback)` 注入已编译的 `WebAssembly.Module`，无需运行时 fetch `.wasm`。

## 使用方式

1. 推送到默认分支，自动触发 CI（或手动运行 Workflow）。
2. CI 成功后，产物生成于 `scripts/php_8_4.js/.wasm`，亦会作为 Artifacts 上传。
3. 部署 Worker；访问根路径应显示 `phpinfo()`。

## 调试

- 若仍然卡死，说明构建仍启用了线程。检索 glue JS 是否包含 `PThread/Atomics.wait/SharedArrayBuffer`。
- 若报 “did not return expected Module”，将 `/__jsplus` 与 `/__probe` 的输出发给我们定位 `init` 签名。
