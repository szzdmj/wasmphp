import { init } from "@php-wasm/web";
declare const __STATIC_CONTENT: Record<string, string>; // Cloudflare Pages/Workers KV static asset mapping

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // 1. 获取 WASM 二进制内容
    const wasmKey = Object.keys(__STATIC_CONTENT).find(k => k.endsWith("php_8_4.wasm"));
    if (!wasmKey) return new Response("php_8_4.wasm not found", { status: 500 });

    const wasmId = __STATIC_CONTENT[wasmKey];
    const wasmUrl = `/cdn-cgi/assets/${wasmId}`; // 见 Cloudflare Pages 文档，或用 asset manifest 直接 fetch

    // 2. 加载 WASM 二进制（如果你本地测试，可以用 fetch 或 Workers 的静态资源 API 读文件）
    const wasmResp = await fetch(wasmUrl);
    const wasmBinary = await wasmResp.arrayBuffer();

    // 3. 初始化 PHP WASM
    const php = await init({
      wasmBinary, // 直接传 ArrayBuffer
      print: (text: string) => console.log("PHP output:", text),
    });
    await php.mount({
      "index.php": `<?php echo "Hello from PHP WASM!";`
    });
    const result = await php.run("index.php");
    return new Response(result.stdout, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
