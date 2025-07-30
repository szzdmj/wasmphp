import { php } from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    const phpInstance = await php();

    const script = `<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`;
    const output = await phpInstance.run(script);

    return new Response(output.stdout, {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
