// replace only this function
async function routeCaps(): Promise<Response> {
  try {
    const { php, debug } = await initPhpModule();

    // Safe count of wasmExports keys
    let wasmExportsCount = 0;
    try {
      const we = (php as any)?.wasmExports;
      if (we && typeof we === "object") {
        wasmExportsCount = Object.keys(we).length;
      }
    } catch {
      wasmExportsCount = 0;
    }

    const caps = {
      hasCallMain: typeof (php as any)?.callMain === "function",
      hasRun: typeof (php as any)?.run === "function",
      hasMain: typeof (php as any)?._main === "function",
      hasFS: !!(php as any)?.FS,
      hasCcall: typeof (php as any)?.ccall === "function",
      hasCwrap: typeof (php as any)?.cwrap === "function",
      wasmExportsCount,
      trace: debug,
    };
    return new Response(JSON.stringify(caps, null, 2), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return new Response("caps error: " + (e?.stack || String(e)), {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
