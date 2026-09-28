/* Optional Cloudflare Worker: fixed UPCitemdb free endpoint, no API key. */
export function validCode(s) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(s || "")) return false;
  let sum = 0;
  for (let i = s.length - 2, w = 3; i >= 0; i--, w = 4 - w) sum += +s[i] * w;
  return (10 - (sum % 10)) % 10 === +s.at(-1);
}
export function reserve(previous, now) {
  const day = new Date(now).toISOString().slice(0, 10),
    p = previous?.day === day ? previous : { day, count: 0, last: 0 };
  if (p.count >= 100 || now - p.last < 10100) return null;
  return { day, count: p.count + 1, last: now };
}
export class Quota {
  constructor(ctx) {
    this.ctx = ctx;
  }
  async fetch() {
    const accepted = await this.ctx.storage.transaction(async (tx) => {
      const next = reserve(await tx.get("quota"), Date.now());
      if (!next) return false;
      await tx.put("quota", next);
      return true;
    });
    return new Response(null, { status: accepted ? 204 : 429 });
  }
}
export async function handle(request, env, fetcher = fetch) {
  const origin = request.headers.get("Origin"),
    allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  if (!origin || !allowed.includes(origin))
    return new Response("Origin not allowed", { status: 403 });
  const headers = {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };
  const reply = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: { ...headers, "Access-Control-Allow-Methods": "GET, OPTIONS" },
    });
  if (request.method !== "GET")
    return reply({ error: "Method not allowed" }, 405);
  const u = new URL(request.url),
    code = u.searchParams.get("barcode");
  if (u.pathname !== "/lookup" || !validCode(code))
    return reply({ error: "Invalid barcode" }, 400);
  if (!env.QUOTA) return reply({ error: "Quota binding missing" }, 503);
  const quota = env.QUOTA.get(env.QUOTA.idFromName("free-upc-global"));
  const allowance = await quota.fetch("https://quota.internal/");
  if (allowance.status !== 204)
    return reply({ error: "Free backup limit reached; retry later" }, 429);
  try {
    const result = await fetcher(
      "https://api.upcitemdb.com/prod/trial/lookup?upc=" + code,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6500),
        redirect: "manual",
      },
    );
    if (!result.ok)
      return reply(
        { error: "Backup unavailable" },
        result.status === 429 ? 429 : 502,
      );
    const d = await result.json();
    // Return only identification fields; no image proxy, arbitrary URLs or secrets.
    const items = (Array.isArray(d.items) ? d.items : [])
      .slice(0, 1)
      .map((p) =>
        Object.fromEntries(
          ["ean", "upc", "title", "brand", "size", "weight"].map((k) => [
            k,
            typeof p[k] === "string" ? p[k].slice(0, 250) : "",
          ]),
        ),
      );
    return reply({ items });
  } catch {
    return reply({ error: "Backup unavailable" }, 502);
  }
}
export default { fetch: (request, env) => handle(request, env) };
