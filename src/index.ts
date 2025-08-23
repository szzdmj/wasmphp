import { init } from "../scripts/php_8_4.js";

export default {
  async fetch(request: Request) {
    const php = await init("WORKER"); // 只需传 "WORKER"，其余参数可省略，除非你有自定义需求

    await php.mount({
      "index.php": `<?php echo "Hello from PHP WASM!";`
    });

    const result = await php.run("index.php");

    return new Response(result.stdout, {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
};
