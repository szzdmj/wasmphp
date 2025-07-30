// src/index.ts
import { PHP } from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    const php = await PHP.load("8.2", {
      wasmBinaryPath: "/php/php.wasm", // 映射 assets 中的 wasm
      documentRoot: "/",
      initialFiles: {
        "/index.php": `
        <?php
          echo "PHP is working! Time: " . date('Y-m-d H:i:s');
        `
      }
    });

    const response = await php.request({
      method: "GET",
      relativeUrl: "/index.php"
    });

    return new Response(response.body, {
      status: response.statusCode,
      headers: Object.fromEntries(response.headers),
    });
  }
};
