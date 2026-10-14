/**
 * Shared HTTP layer used by every endpoint helper.
 *
 * - Uses Node's built-in `fetch` (undici) which pools and keeps connections alive.
 * - De-duplicates identical in-flight GET requests (same URL + token).
 * - Retries 429 responses honoring `Retry-After`, and transient 5xx/network errors with backoff.
 * - Drops `undefined`/`null` query params (e.g. an omitted optional `device_id`).
 * @module http
 */

/** @type {{maxRetries:number, retryBaseDelayMs:number, maxRetryDelayMs:number, dedupe:boolean}} */
export const httpConfig = {
    maxRetries: 3,
    retryBaseDelayMs: 500,
    maxRetryDelayMs: 30000,
    dedupe: true,
};

/**
 * Update global HTTP behaviour.
 * @param {Partial<typeof httpConfig>} options
 */
export function configureHttp(options = {}) {
    Object.assign(httpConfig, options);
    return { ...httpConfig };
}

const inflight = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Error thrown by request helpers that opt into throwing (`SpotifyClient`, `spotifyRequest`). */
export class SpotifyApiError extends Error {
    constructor(message, { status, body, headers, url } = {}) {
        super(message);
        this.name = 'SpotifyApiError';
        this.status = status;
        this.body = body;
        this.headers = headers;
        this.url = url;
    }
}

function cleanUrl(url) {
    if (typeof url !== 'string' || !url.includes('?')) return url;
    try {
        const u = new URL(url);
        for (const [k, v] of [...u.searchParams.entries()]) {
            if (v === 'undefined' || v === 'null' || v === '') u.searchParams.delete(k);
        }
        return u.toString();
    } catch {
        return url;
    }
}

function getHeader(res, name) {
    const h = res && res.headers;
    if (!h) return null;
    if (typeof h.get === 'function') return h.get(name);
    return h[name] ?? h[name.toLowerCase()] ?? null;
}

function retryDelay(res, attempt) {
    const ra = getHeader(res, 'retry-after');
    if (ra != null && !Number.isNaN(Number(ra))) {
        return Math.min(Number(ra) * 1000, httpConfig.maxRetryDelayMs);
    }
    const backoff = httpConfig.retryBaseDelayMs * 2 ** attempt;
    return Math.min(backoff + Math.random() * 100, httpConfig.maxRetryDelayMs);
}

async function fetchWithRetry(url, options) {
    let attempt = 0;
    for (;;) {
        let res;
        try {
            res = await globalThis.fetch(url, options);
        } catch (err) {
            if (attempt >= httpConfig.maxRetries || err?.name === 'AbortError') throw err;
            await sleep(retryDelay(null, attempt++));
            continue;
        }
        const status = res && res.status;
        const retryable = status === 429 || (status >= 500 && status !== 501);
        if (!retryable || attempt >= httpConfig.maxRetries) return res;
        await sleep(retryDelay(res, attempt++));
    }
}

/**
 * Drop-in `fetch` replacement with keep-alive, retry and GET de-duplication.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export default function spotifyFetch(url, options = {}) {
    url = cleanUrl(url);
    const method = (options.method || 'GET').toUpperCase();
    if (!httpConfig.dedupe || method !== 'GET' || options.body) {
        return fetchWithRetry(url, options);
    }
    const auth = options.headers?.Authorization || options.headers?.authorization || '';
    const key = `${url}\n${auth}`;
    let shared = inflight.get(key);
    if (!shared) {
        shared = fetchWithRetry(url, options).finally(() => inflight.delete(key));
        inflight.set(key, shared);
        // Callers each get their own clone, so bodies can be read independently.
    }
    return shared.then((res) => (res && typeof res.clone === 'function' ? res.clone() : res));
}

/**
 * Parse a response: JSON when present, `null` for 204/empty bodies.
 * @param {Response} res
 */
export async function parseBody(res) {
    if (!res) return null;
    if (res.status === 204) return null;
    if (typeof res.text !== 'function') return res.json ? res.json() : null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
}
