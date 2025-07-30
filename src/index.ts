import { PHP } from "@php-wasm/web";

// 读取 public/index.php 内容（建议放在 assets 中供 fetch）
const INDEX_PHP_URL = new URL("../public/index.php", import.meta.url).href;

export default {
  async fetch(request: Request): Promise<Response> {
    // 获取 index.php 的源码
    const phpCodeResp = await fetch(INDEX_PHP_URL);
    if (!phpCodeResp.ok) {
      return new Response("Failed to load index.php", { status: 500 });
    }
    const phpCode = await phpCodeResp.text();

    // 初始化 PHP-WASM 实例（默认使用 web 适配版本）
    const php = await PHP.load();

    // 执行 PHP 代码
    const result = await php.run(phpCode);

    // 返回结果
