import { loadPHP } from "@php-wasm/web";

export default {
  async fetch(req: Request): Promise<Response> {
    const php = await loadPHP();

    const script = `<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`;

    const output = await php.run(script);

    return new Response(output);
  },
};
