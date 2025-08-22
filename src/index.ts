import * as phpWasmModule from "@php-wasm/web/php/asyncify/8_4_10/php_8_4.js";

export default {
  async fetch(req: Request): Promise<Response> {
    // 使用正确的工厂函数
    const php = await phpWasmModule.init(
      "WEB", // 或 "WORKER"，根据你的环境
      {
        print: (text: string) => console.log("PHP output:", text),
      }
    );

    await php.mount({
      "index.php": `<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`,
    });

    const result = await php.run("index.php");

    return new Response(result.stdout, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
