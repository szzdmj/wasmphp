import { PHP } from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    const php = new PHP({
      // 将 php.ini 内容设置为空或最小化
      ini: "",
      requestHandler: {
        async handle(path, output) {
          if (path === "/index.php") {
            output.write(`<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`);
          } else {
            output.write("<?php http_response_code(404); echo 'Not Found'; ?>");
          }
        }
      },
    });

    const url = new URL(request.url);
    const phpResponse = await php.run({
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: request.body ? await request.text() : undefined,
      uri: url.pathname,
    });

    return new Response(phpResponse.body, {
      status: phpResponse.status,
      headers: phpResponse.headers,
    });
  }
};
