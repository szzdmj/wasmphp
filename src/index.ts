import { init, dependencyFilename } from '../scripts/php_8_4.js';

export default {
  async fetch(request, env, ctx) {
    // 输出类型与内容
    return new Response(
      `typeof dependencyFilename: ${typeof dependencyFilename}; is Uint8Array: ${dependencyFilename instanceof Uint8Array}`,
      { status: 200 }
    );
  }
}
