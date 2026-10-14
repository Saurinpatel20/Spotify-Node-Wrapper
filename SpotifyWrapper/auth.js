import crypto from 'node:crypto';
import http from 'node:http';
import { SpotifyApiError, parseBody } from './http.js';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const env = (k) => (typeof process !== 'undefined' ? process.env[k] : undefined);

/**
 * @typedef {object} SpotifyToken
 * @property {string} access_token
 * @property {string} token_type
 * @property {number} expires_in   Seconds until expiry, as returned by Spotify.
 * @property {number} expires_at   Epoch ms when the token expires (added by this library).
 * @property {string} [refresh_token]
 * @property {string} [scope]
 */

function resolveCreds(clientId, clientSecret) {
    const id = clientId ?? env('SPOTIFY_CLIENT_ID') ?? env('CLIENT_ID');
    const secret = clientSecret ?? env('SPOTIFY_CLIENT_SECRET') ?? env('CLIENT_SECRET');
    return { id, secret };
}

async function postToken(params, { clientId, clientSecret } = {}) {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (clientSecret) {
        headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    } else if (clientId) {
        params.client_id = clientId; // PKCE / public client
    }
    const res = await globalThis.fetch(TOKEN_URL, {
        method: 'POST', headers, body: new URLSearchParams(params),
    });
    const data = await parseBody(res);
    if (res.ok === false || !data || !data.access_token) {
        throw new SpotifyApiError(
            `Spotify token request failed: ${data?.error_description || data?.error || res.status}`,
            { status: res.status, body: data, url: TOKEN_URL },
        );
    }
    return { ...data, expires_at: Date.now() + (data.expires_in ?? 3600) * 1000 };
}

/**
 * Mint an app-only token with the Client Credentials flow (one call).
 * Falls back to `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` env vars.
 * @param {string} [clientId]
 * @param {string} [clientSecret]
 * @returns {Promise<SpotifyToken>}
 */
export async function getClientCredentialsToken(clientId, clientSecret) {
    const { id, secret } = resolveCreds(clientId, clientSecret);
    if (!id || !secret) throw new Error('Missing Spotify client id/secret (pass them or set SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET).');
    return postToken({ grant_type: 'client_credentials' }, { clientId: id, clientSecret: secret });
}

/**
 * Backwards-compatible helper: returns just the access token string.
 * `redirectUri` is accepted for compatibility but unused by the client-credentials flow.
 * @param {string} [clientId]
 * @param {string} [clientSecret]
 * @param {string} [_redirectUri]
 * @returns {Promise<string>}
 */
export async function getSpotifyAccessToken(clientId, clientSecret, _redirectUri) {
    return (await getClientCredentialsToken(clientId, clientSecret)).access_token;
}

/**
 * Generate a PKCE verifier/challenge pair.
 * @returns {{codeVerifier: string, codeChallenge: string}}
 */
export function generatePkcePair() {
    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return { codeVerifier, codeChallenge };
}

/**
 * Build the Spotify authorize URL for the Authorization Code (optionally PKCE) flow.
 * @param {object} opts
 * @param {string} [opts.clientId]
 * @param {string} [opts.redirectUri]
 * @param {string[]|string} [opts.scopes]
 * @param {string} [opts.state]
 * @param {string} [opts.codeChallenge]
 * @param {boolean} [opts.showDialog]
 * @returns {string}
 */
export function getAuthorizationUrl({ clientId, redirectUri, scopes = [], state, codeChallenge, showDialog } = {}) {
    const id = clientId ?? resolveCreds().id;
    const redirect = redirectUri ?? env('SPOTIFY_REDIRECT_URI') ?? env('REDIRECT_URI');
    if (!id || !redirect) throw new Error('clientId and redirectUri are required.');
    const p = new URLSearchParams({ client_id: id, response_type: 'code', redirect_uri: redirect });
    const scope = Array.isArray(scopes) ? scopes.join(' ') : scopes;
    if (scope) p.set('scope', scope);
    if (state) p.set('state', state);
    if (codeChallenge) { p.set('code_challenge_method', 'S256'); p.set('code_challenge', codeChallenge); }
    if (showDialog) p.set('show_dialog', 'true');
    return `${AUTHORIZE_URL}?${p}`;
}

/**
 * Exchange an authorization code for user tokens.
 * Provide `clientSecret` (confidential app) or `codeVerifier` (PKCE).
 * @returns {Promise<SpotifyToken>}
 */
export async function exchangeAuthorizationCode({ code, redirectUri, clientId, clientSecret, codeVerifier }) {
    const id = clientId ?? resolveCreds().id;
    const secret = codeVerifier ? clientSecret : (clientSecret ?? resolveCreds().secret);
    const params = { grant_type: 'authorization_code', code, redirect_uri: redirectUri ?? env('SPOTIFY_REDIRECT_URI') ?? env('REDIRECT_URI') };
    if (codeVerifier) params.code_verifier = codeVerifier;
    return postToken(params, { clientId: id, clientSecret: secret });
}

/**
 * Refresh a user access token. Keeps the old refresh token if Spotify does not rotate it.
 * @returns {Promise<SpotifyToken>}
 */
export async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
    const id = clientId ?? resolveCreds().id;
    const secret = clientSecret ?? resolveCreds().secret;
    const t = await postToken({ grant_type: 'refresh_token', refresh_token: refreshToken }, { clientId: id, clientSecret: secret });
    return { refresh_token: refreshToken, ...t };
}

/**
 * One-call interactive login for CLIs/scripts: starts a local callback server,
 * gives you the authorize URL (and opens it via `onUrl`), and resolves with user tokens.
 * Uses PKCE, so no client secret is needed.
 * @param {object} opts
 * @param {string} [opts.clientId]
 * @param {string[]|string} [opts.scopes]
 * @param {string} [opts.redirectUri] Default `http://127.0.0.1:8888/callback` (must be registered in your app).
 * @param {(url:string)=>void} [opts.onUrl] Called with the URL to open. Defaults to console.log.
 * @param {number} [opts.timeoutMs] Default 5 minutes.
 * @returns {Promise<SpotifyToken>}
 */
export function authorizeWithLocalServer({ clientId, scopes = [], redirectUri, onUrl, timeoutMs = 300000 } = {}) {
    const redirect = redirectUri ?? env('SPOTIFY_REDIRECT_URI') ?? 'http://127.0.0.1:8888/callback';
    const u = new URL(redirect);
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = crypto.randomBytes(16).toString('hex');
    const id = clientId ?? resolveCreds().id;
    const url = getAuthorizationUrl({ clientId: id, redirectUri: redirect, scopes, state, codeChallenge });

    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            const q = new URL(req.url, redirect);
            if (q.pathname !== u.pathname) { res.writeHead(404).end(); return; }
            const done = (err, tok) => {
                res.writeHead(err ? 400 : 200, { 'Content-Type': 'text/plain' })
                    .end(err ? `Authorization failed: ${err.message}` : 'Spotify authorization complete. You can close this tab.');
                clearTimeout(timer); server.close();
                err ? reject(err) : resolve(tok);
            };
            if (q.searchParams.get('error')) return done(new Error(q.searchParams.get('error')));
            if (q.searchParams.get('state') !== state) return done(new Error('State mismatch'));
            try {
                done(null, await exchangeAuthorizationCode({ code: q.searchParams.get('code'), redirectUri: redirect, clientId: id, codeVerifier }));
            } catch (e) { done(e); }
        });
        const timer = setTimeout(() => { server.close(); reject(new Error('Authorization timed out')); }, timeoutMs);
        server.on('error', (e) => { clearTimeout(timer); reject(e); });
        server.listen(Number(u.port) || 80, u.hostname, () => (onUrl || ((x) => console.log(`Open this URL to authorize:\n${x}`)))(url));
    });
}

/**
 * Create a token manager that caches the token and refreshes it shortly before expiry.
 * Concurrent callers share one in-flight refresh.
 * @param {object} [opts]
 * @param {string} [opts.clientId]
 * @param {string} [opts.clientSecret]
 * @param {string} [opts.refreshToken] If set, uses the refresh-token flow (user context).
 * @param {SpotifyToken} [opts.token] Initial token, if you already have one.
 * @param {number} [opts.refreshMarginMs] Refresh this long before expiry. Default 60s.
 * @param {(t:SpotifyToken)=>void} [opts.onToken] Called whenever a new token is minted (persist it here).
 * @returns {{getAccessToken:()=>Promise<string>, getToken:()=>Promise<SpotifyToken>, invalidate:()=>void}}
 */
export function createTokenManager({ clientId, clientSecret, refreshToken, token, refreshMarginMs = 60000, onToken } = {}) {
    let current = token || null;
    let pending = null;
    let rt = refreshToken ?? token?.refresh_token ?? env('SPOTIFY_REFRESH_TOKEN');
    const fresh = () => current && current.expires_at - refreshMarginMs > Date.now();
    const mint = async () => {
        const t = rt
            ? await refreshAccessToken({ refreshToken: rt, clientId, clientSecret })
            : await getClientCredentialsToken(clientId, clientSecret);
        if (t.refresh_token) rt = t.refresh_token;
        current = t;
        onToken?.(t);
        return t;
    };
    const getToken = async () => {
        if (fresh()) return current;
        if (!pending) pending = mint().finally(() => { pending = null; });
        return pending;
    };
    return {
        getToken,
        getAccessToken: async () => (await getToken()).access_token,
        invalidate: () => { current = null; },
    };
}

