import phpWasm from "@php-wasm/web";
export default {
  async fetch(req: Request): Promise<Response> {
    const php = new PHP({
      print: (text) => console.log("PHP output:", text),
    });

    await php.mount({ "index.php": <?php echo "Hello from PHP running inside Cloudflare Worker!"; ?> });

    const result = await php.run("index.php");

    return new Response(result.stdout, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
