// Cloudflare Workers friendly wrapper around Emscripten glue.
// - Adds safe polyfills for `location.href` and `self` before loading the original glue.
// - Dynamically imports the original ESM so top-level evaluation sees the polyfills.
// - Re-exports the factory as default, preserving the original API.

const g = globalThis;

// Provide a minimal `location.href` so glue's scriptDirectory detection won't throw.
if (typeof g.location === 'undefined' || typeof g.location?.href === 'undefined') {
  try {
    Object.defineProperty(g, 'location', {
      value: { href: 'file:///' },
      configurable: true,
      enumerable: false,
      writable: false,
    });
  } catch {
    // Best effort; if defineProperty fails, ignore.
  }
}

// Ensure `self` exists and mirrors the global (some glue checks `self.location`)
if (typeof g.self === 'undefined') {
  try {
    Object.defineProperty(g, 'self', {
      value: g,
      configurable: true,
      enumerable: false,
      writable: false,
    });
  } catch {
    // ignore
  }
} else if (typeof g.self.location === 'undefined' && typeof g.location !== 'undefined') {
  try {
    g.self.location = g.location;
  } catch {
    // ignore
  }
}

// Export a wrapper factory that lazily loads the original glue after polyfills are set.
export default async function createPHP(opts) {
  const mod = await import('./php_8_4.js');
  // Emscripten default export is a factory returning a Promise
  return mod.default(opts);
}
