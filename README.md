# wasmphp

A Cloudflare Worker that runs PHP 8.4 via WebAssembly (WASM). This implementation uses a static import approach to avoid `import.meta.url` issues in the Cloudflare Workers Module environment.

## Testing

The Worker provides several testing switches and endpoints:

### Basic Usage
- `GET /` - Runs default PHP code: `echo "Hello from PHP WASM in Cloudflare Worker\n";`
- `GET /?code=<php_code>` - Runs custom PHP code
- `GET /info` - Runs `phpinfo();`

### WASM Loading Options
- `GET /?useUpstream=1` - Load WASM directly from GitHub upstream URL
- `GET /?inline=1` - Prefetch WASM bytes and pass as `wasmBinary` (networkless instantiation)
- `GET /?useOrigin=scripts` - Use same-origin `/scripts/php_8_4.wasm` route
- `GET /?useOrigin=wasm` - Use same-origin `/wasm/php_8_4.wasm` route

### WASM File Access
- `GET /scripts/php_8_4.wasm` - Download WASM file via scripts route (includes `x-worker-route: scripts` header)
- `GET /wasm/php_8_4.wasm` - Download WASM file via wasm route (includes `x-worker-route: wasm` header)

### Diagnostics
- `GET /__probe` - JSON response showing:
  - Whether `import.meta.url` is available in the Worker context
  - Results of self-fetch tests to same-origin WASM URLs
  - Upstream WASM availability
  - Whether `selfFetchLikelyBlocked` is true (indicating Workers self-call protection is active)

### Health Check
- `GET /health` - Simple health check endpoint

## Examples

```bash
# Test basic PHP execution (may fail if self-fetch is blocked)
curl https://your-worker.workers.dev/

# Test with upstream WASM loading (should always work)
curl https://your-worker.workers.dev/?useUpstream=1

# Test with inline WASM loading (should always work)
curl https://your-worker.workers.dev/?inline=1

# Download WASM file and check headers
curl -I https://your-worker.workers.dev/scripts/php_8_4.wasm

# Check Worker diagnostics
curl https://your-worker.workers.dev/__probe

# Run custom PHP code
curl "https://your-worker.workers.dev/?useUpstream=1&code=echo%20phpversion();"
```

## Implementation Notes

This Worker uses a patched Emscripten glue file (`scripts/php_8_4_cf.js`) where all `import.meta.url` references have been replaced with `undefined` to prevent runtime errors in the Cloudflare Workers environment. The Worker provides multiple fallback mechanisms for WASM loading to ensure reliable operation.