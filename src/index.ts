// 只用 asyncify 路径下的 JS 
import initPHP from "@php-wasm/web/php/asyncify/8_4_10/php_8_4.js"; // 路径以 node_modules/@php-wasm/web/php/asyncify/8_4_10 下实际为准

export default {
  async fetch(request: Request) {
    // 让 asyncify loader 自动寻找 .wasm 文件（需 wrangler rules 支持）
    const php = await initPHP({
      locateFile: (file: string) => {
        // 只会用到 .wasm
        if (file.endsWith('.wasm')) return '/scripts/php_8_4.wasm';
        return file;
      },
      print: (text: string) => console.log("PHP output:", text),
    });

    await php.mount({
      "index.php": `<?php echo "Hello from PHP WASM!";`
    });
    const result = await php.run("index.php");

    return new Response(result.stdout, {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
};
