// src/index.ts
import { Hono } from "hono";

export interface Env {
  // KV 命名空间绑定
  STATIC_KV: KVNamespace;
}

// 初始化 Hono 应用
const app = new Hono();

// 静态文件扩展名匹配
const STATIC_EXT =
  /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|json|txt|woff2?|ttf|map|html?)$/i;

// 静态文件路由：从 KV 中读取并返回
app.get("*", async (c, next) => {
  const url = new URL(c.req.url);

  if (STATIC_EXT.test(url.pathname)) {
    const key = url.pathname.replace(/^\//, ""); // 去掉开头的斜杠
    const object = await c.env.STATIC_KV.get(key, "arrayBuffer");

    if (object) {
      return new Response(object, {
        headers: {
          "content-type": getContentType(key),
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return next();
});

// 默认首页
app.get("/", async (c) => {
  return c.text("Hello from Hono + Workers + Static Files!");
});

// 简单 API 示例
app.get("/api/hello", (c) => {
  return c.json({ message: "Hello API!" });
});

// Content-Type 判断函数
function getContentType(path: string): string {
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".txt")) return "text/plain";
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".woff")) return "font/woff";
  if (path.endsWith(".ttf")) return "font/ttf";
  if (path.endsWith(".map")) return "application/json";
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  return "application/octet-stream";
}

export default app;
