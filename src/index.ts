-      if (pathname === "/" || pathname === "/index.php" || pathname === "/info") {
-        return routeInfo(url);
-      }
+      // 首页直接渲染仓库的 /public/index.php
+      if (pathname === "/" || pathname === "/index.php") {
+        return routeRepoIndex(url);
+      }
+      // 如需 phpinfo，访问 /info
+      if (pathname === "/info") {
+        return routeInfo(url);
+      }
