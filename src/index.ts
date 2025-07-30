export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === "/php") {
      // 简单响应
      return new Response("PHP WASM worker active")
    }

    return new Response("OK")
  }
}
