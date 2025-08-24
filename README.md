# wasmphp

A PHP WebAssembly implementation for Cloudflare Workers.

## Two Implementation Approaches

This repository provides two different approaches for handling WASM loading in Cloudflare Workers:

### PR A (Previous): Upstream Network Load by Default
- Default behavior uses upstream network loading during WASM instantiation
- Dynamic code patching with `new Function()` to fix `import.meta.url` issues
- Opt-in to inline mode with `?inline=1`

### PR B (This Implementation): Inline wasmBinary by Default
- **Default behavior**: Prefetches WASM as `wasmBinary`, eliminating network requests during instantiation
- Static import of pre-patched `scripts/php_8_4_cf.js` (no dynamic code evaluation)
- Opt-out of inline mode with `?inline=0`
- More reliable in Workers environments due to offline instantiation

## Query Parameters

- `?inline=0` - Disable inline mode, use `locateFile` for WASM loading
- `?useUpstream=1` - Force upstream URL for WASM (bypasses same-origin routes)
- `?useOrigin=scripts` - Use same-origin `/scripts/` route for WASM
- `?useOrigin=wasm` - Use same-origin `/wasm/` route for WASM
- `?code=<php>` - Execute custom PHP code

## Endpoints

- `GET /` - Execute default PHP script (inline mode by default)
- `GET /info` - Display PHP info
- `GET /__probe` - Diagnostics endpoint showing route status and upstream connectivity
- `GET /scripts/php_8_4.wasm` - Proxy to upstream WASM (includes `x-worker-route: scripts` header)
- `GET /wasm/php_8_4.wasm` - Alternative proxy to upstream WASM (includes `x-worker-route: wasm` header)