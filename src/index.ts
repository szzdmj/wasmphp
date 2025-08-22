import { PHP } from "@php-wasm/web";

export default {
  async fetch(req: Request): Promise<Response> {
    try {
      // 示例：可以根据实际需求动态传入 PHP 代码
      const phpCode = `<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`;
      const php = new PHP({
        print: (text: string) => console.log("PHP output:", text),
      });

      await php.mount({ "index.php": phpCode });

      const result = await php.run("index.php");

      return new Response(result.stdout, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (err: any) {
      return new Response("PHP WASM error: " + (err?.message || err), { status: 500 });
    }
  },
};
