import spotifyFetch, { SpotifyApiError, parseBody, configureHttp } from './http.js';
import { createTokenManager } from './auth.js';

export const BASE_URI = 'https://api.spotify.com/v1/';

/**
 * Low-level request that throws `SpotifyApiError` on non-2xx.
 * @param {string} accessToken
 * @param {string} path  Path relative to /v1 (e.g. `me/playlists`) or an absolute URL.
 * @param {{method?:string, query?:Record<string,any>, body?:any, headers?:Record<string,string>, signal?:AbortSignal}} [opts]
 */
export async function spotifyRequest(accessToken, path, { method = 'GET', query, body, headers = {}, signal } = {}) {
    const url = new URL(/^https?:/.test(path) ? path : BASE_URI + path.replace(/^\//, ''));
    for (const [k, v] of Object.entries(query || {})) {
        if (v !== undefined && v !== null) url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
    const init = { method, signal, headers: { Authorization: `Bearer ${accessToken}`, ...headers } };
    if (body !== undefined) {
        if (typeof body === 'string' || body instanceof Uint8Array) init.body = body;
        else { init.body = JSON.stringify(body); init.headers['Content-Type'] = 'application/json'; }
    }
    const res = await spotifyFetch(url.toString(), init);
    const data = await parseBody(res);
    if (res.ok === false) {
        const msg = data?.error?.message || data?.error_description || `HTTP ${res.status}`;
        throw new SpotifyApiError(`Spotify API error ${res.status}: ${msg}`, { status: res.status, body: data, headers: res.headers, url: url.toString() });
    }
    return data;
}

function unwrapPage(data) {
    if (data && Array.isArray(data.items)) return data;
    // e.g. search results ({ tracks: {items,next} }) or followed artists ({ artists: {...} })
    const inner = data && Object.values(data).find((v) => v && Array.isArray(v.items));
    return inner || { items: [], next: null };
}

/**
 * Async iterator over every item of a paginated endpoint, following `next` links.
 * @param {string|(()=>Promise<string>)} accessToken  A token or an async token getter.
 * @param {string|object} start  A path/URL, or a first page object already fetched.
 * @param {{query?:object, maxItems?:number}} [opts]
 */
export async function* paginate(accessToken, start, { query, maxItems = Infinity } = {}) {
    const tok = typeof accessToken === 'function' ? accessToken : async () => accessToken;
    let page = typeof start === 'object' ? unwrapPage(start)
        : unwrapPage(await spotifyRequest(await tok(), start, { query: { limit: 50, ...query } }));
    let n = 0;
    for (;;) {
        for (const item of page.items) { if (n++ >= maxItems) return; yield item; }
        if (!page.next) return;
        page = unwrapPage(await spotifyRequest(await tok(), page.next));
    }
}

/** Collect all items from a paginated endpoint into an array. */
export async function getAll(accessToken, start, opts) {
    const out = [];
    for await (const item of paginate(accessToken, start, opts)) out.push(item);
    return out;
}

/** Split an array into chunks of `size` (Spotify bulk endpoints accept 20/50/100 IDs). */
export function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

/**
 * High-level client: handles token minting, caching and refresh automatically, and exposes
 * every endpoint helper without needing to pass `accessToken`.
 *
 * @example
 * const spotify = new SpotifyClient(); // reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET
 * const album = await spotify.getAlbum('7ErFctcmAOQiP6xNktc5lX');
 */
export class SpotifyClient {
    /**
     * @param {object} [opts]
     * @param {string} [opts.clientId]
     * @param {string} [opts.clientSecret]
     * @param {string} [opts.refreshToken]  Use user-context refresh flow.
     * @param {string} [opts.accessToken]   Static token (no auto-refresh).
     * @param {import('./auth.js').SpotifyToken} [opts.token]
     * @param {(t:object)=>void} [opts.onToken]
     * @param {{maxRetries?:number, dedupe?:boolean}} [opts.http]
     */
    constructor(opts = {}) {
        if (opts.http) configureHttp(opts.http);
        if (opts.accessToken) {
            const t = opts.accessToken;
            this.tokens = { getAccessToken: async () => t, getToken: async () => ({ access_token: t }), invalidate() {} };
        } else {
            this.tokens = createTokenManager(opts);
        }
    }

    /** @returns {Promise<string>} */
    getAccessToken() { return this.tokens.getAccessToken(); }

    /** Generic request with auto token and one retry on 401 (token revoked/expired early). */
    async request(path, opts) {
        try {
            return await spotifyRequest(await this.getAccessToken(), path, opts);
        } catch (e) {
            if (e.status !== 401) throw e;
            this.tokens.invalidate();
            return spotifyRequest(await this.getAccessToken(), path, opts);
        }
    }

    paginate(start, opts) { return paginate(() => this.getAccessToken(), start, opts); }
    getAll(start, opts) { return getAll(() => this.getAccessToken(), start, opts); }
}

/** @internal attach token-less versions of the functional helpers to the client prototype. */
export function bindEndpoints(fns) {
    for (const [name, fn] of Object.entries(fns)) {
        if (name in SpotifyClient.prototype) continue;
        Object.defineProperty(SpotifyClient.prototype, name, {
            value: async function (...args) { return fn(await this.getAccessToken(), ...args); },
            writable: true, configurable: true,
        });
    }
}
