import { createPHP } from "@php-wasm/web/dist/php-wasm-web.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const php = await createPHP();

    const output = await php.run(`<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`);

    return new Response(output.stdout, {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
