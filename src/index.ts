import { PHP } from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    const php = await PHP.load("8.0", {
      requestHandler: { documentRoot: "/www" }
    });
    // 写入文件结构，例如 public/index.php
    php.mkdirTree("/www");
    php.writeFile("/www/index.php", `<?php echo "Hello from PHP‑WASM!"; ?>`);
    const resp = await php.request({
      method: request.method,
      url: request.url.replace(location.origin, ""),
    });
    return new Response(resp.text, { status: resp.status });
  }
};
