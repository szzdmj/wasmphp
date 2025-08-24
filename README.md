# WasmPHP Cloudflare Worker

A Cloudflare Worker that serves PHP 8.4 via WebAssembly, eliminating dynamic code generation and import.meta.url issues.

## Testing Switches and Routes

### Main Routes
- `GET /` - Default PHP execution (Hello from PHP WASM...)  
- `GET /?useUpstream=1` - Force upstream WASM loading
- `GET /?inline=1` - Preload WASM binary inline to avoid network requests
- `GET /?useOrigin=scripts` - Use origin /scripts/ path for WASM
- `GET /?useOrigin=wasm` - Use origin /wasm/ path for WASM
- `GET /info` - Display phpinfo()
- `GET /?code=<php-code>` - Execute custom PHP code

### Utility Routes  
- `GET /__probe` - JSON diagnostic info including selfFetchLikelyBlocked status
- `GET /health` - Simple health check
- `GET /scripts/php_8_4.wasm` - WASM file with x-worker-route headers
- `GET /wasm/php_8_4.wasm` - Alternative WASM path with x-worker-route headers

## Defaults
- Without parameters: Uses upstream WASM loading by default
- WASM is fetched from GitHub raw on demand unless `inline=1` is used
- No dynamic code generation or import.meta.url usage in Workers environment