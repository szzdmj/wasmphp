import php from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    await php.ready;

    // 读取 public/index.php 的内容
    const phpScript = `<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`;

    try {
      // 清空之前的输出缓存（可选）
      php.module.ccall("clear_output", null, [], []);

      // 运行 PHP 脚本
      const result = php.run(phpScript);

      return new Response(result, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    } catch (e) {
      return new Response(`PHP Runtime Error: ${e}`, {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  },
};
