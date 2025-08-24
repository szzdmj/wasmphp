# wasmphp

Run PHP 8.4 in WebAssembly via Cloudflare Workers, now with two strategies for loading WASM modules:

## Loading Strategies

### Default: Inline Mode (Option 2)
By default, the worker uses **inline mode** which prefetches the WASM binary and passes it directly to the Emscripten factory. This eliminates runtime network requests during instantiation and avoids dynamic code generation issues in Cloudflare Workers.

- **Default behavior**: GET `/` automatically prefetches WASM and initializes PHP
- **Disable**: Use `?inline=0` to switch to network-based loading

### Network-based Mode (Option 1)  
When inline mode is disabled (`?inline=0`), the WASM binary is loaded on-demand via network requests using the `locateFile` mechanism.

## Query Parameters

- `?inline=0` - Disable inline mode (use network-based loading instead)
- `?useUpstream=1` - Force upstream GitHub raw URLs for WASM loading
- `?useOrigin=scripts` - Use same-origin `/scripts/php_8_4.wasm` proxy route
- `?useOrigin=wasm` - Use same-origin `/wasm/php_8_4.wasm` proxy route  

## Routes

- `GET /` - Run PHP with default code
- `GET /?code=<?php echo 'Hello';` - Run custom PHP code  
- `GET /info` - Show phpinfo() 
- `GET /scripts/php_8_4.wasm` - Proxy to upstream WASM (with `x-worker-route: scripts` header)
- `GET /wasm/php_8_4.wasm` - Proxy to upstream WASM (with `x-worker-route: wasm` header)
- `GET /__probe` - Diagnostic endpoint for environment detection
- `GET /health` - Health check

## Examples

```bash
# Default inline mode
curl https://your-worker.domain/

# Disable inline mode, use upstream  
curl "https://your-worker.domain/?inline=0&useUpstream=1"

# Use same-origin proxy route
curl "https://your-worker.domain/?inline=0&useOrigin=scripts"

# Run custom PHP code
curl "https://your-worker.domain/?code=<?php echo date('Y-m-d H:i:s');"
```

## Changes in This Version

This version removes all dynamic code generation (`new Function`, `eval`) to fix `EvalError: Code generation from strings disallowed` in Cloudflare Workers. The implementation now uses static imports and defaults to inline mode for better compatibility.