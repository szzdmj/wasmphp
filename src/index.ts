import { init } from "@php-wasm/web";
export default {
  async fetch(request: Request, env: any, ctx: any) {
    const php = await init({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) return '/scripts/php_8_4.wasm';
        if (file.endsWith('.dat')) return '/node_modules/@php-wasm/web/shared/icudt74l.dat';
        return file;
      },
      print: (text: string) => console.log("PHP output:", text),
    });
    await php.mount({
      "index.php": `<?php echo "Hello from PHP WASM!";`
    });
    const result = await php.run("index.php");
    return new Response(result.stdout);
  }
};
