import phpWasm from "@php-wasm/web";

export default {
  async fetch(request: Request): Promise<Response> {
    const php = await phpWasm({
      // 你可以配置 php.ini 设置或不设置
      ini: "",
      requestHandler: {
        async handle(path, output) {
          if (path === "/index.php") {
            output.write(`<?php echo "Hello from PHP running inside Cloudflare Worker!"; ?>`);
          } else {
            output.write("<?php http_response_code(404); echo 'Not Found'; ?>");
          }
        },
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
  },
};
