import { PHP } from '@php-wasm/web'; // 浏览器环境适用

const php = await PHP.load('8.0', {
  requestHandler: { documentRoot: '/app/public' } // 访问路径
});

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/phpinfo') {
      php.writeFile('/app/public/info.php', `<?php phpinfo(); ?>`);
      const response = await php.run({ scriptPath: '/app/public/info.php' });
      return new Response(response.text, { headers: { 'Content-Type': 'text/html' } });
    }
    // 默认返回静态文件或提示
    return new Response('Choose /phpinfo', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}
