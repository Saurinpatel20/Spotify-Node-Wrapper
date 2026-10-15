import { describe, it, afterEach } from 'node:test';
import assert from 'assert';
import {
    SpotifyClient, createTokenManager, getClientCredentialsToken, generatePkcePair,
    getAuthorizationUrl, spotifyFetch, configureHttp, getAll, chunk, SpotifyApiError,
    getAudiobook, startPlayback,
} from '../index.js';

const realFetch = globalThis.fetch;
const json = (b, status = 200, headers = {}) => new Response(b == null ? null : JSON.stringify(b), { status, headers });
afterEach(() => { globalThis.fetch = realFetch; configureHttp({ maxRetries: 3, retryBaseDelayMs: 500, dedupe: true }); });

describe('auth', () => {
    it('client credentials returns token with expires_at', async () => {
        let seen;
        globalThis.fetch = async (url, init) => { seen = init; return json({ access_token: 'a', expires_in: 3600 }); };
        const t = await getClientCredentialsToken('id', 'sec');
        assert.strictEqual(t.access_token, 'a');
        assert(t.expires_at > Date.now());
        assert.match(seen.headers.Authorization, /^Basic /);
        assert.strictEqual(new URLSearchParams(seen.body.toString()).get('grant_type'), 'client_credentials');
    });
    it('throws SpotifyApiError on bad credentials', async () => {
        globalThis.fetch = async () => json({ error: 'invalid_client' }, 400);
        await assert.rejects(getClientCredentialsToken('id', 'bad'), SpotifyApiError);
    });
    it('token manager caches and shares refresh', async () => {
        let calls = 0;
        globalThis.fetch = async () => { calls++; return json({ access_token: `t${calls}`, expires_in: 3600 }); };
        const m = createTokenManager({ clientId: 'i', clientSecret: 's' });
        const [a, b] = await Promise.all([m.getAccessToken(), m.getAccessToken()]);
        assert.strictEqual(a, 't1'); assert.strictEqual(b, 't1');
        await m.getAccessToken();
        assert.strictEqual(calls, 1);
        m.invalidate();
        assert.strictEqual(await m.getAccessToken(), 't2');
    });
    it('refreshes before expiry using refresh token', async () => {
        const bodies = [];
        globalThis.fetch = async (u, init) => { bodies.push(new URLSearchParams(init.body.toString())); return json({ access_token: 'new', expires_in: 3600 }); };
        const m = createTokenManager({ clientId: 'i', clientSecret: 's', token: { access_token: 'old', expires_at: Date.now() + 1000, refresh_token: 'r' } });
        assert.strictEqual(await m.getAccessToken(), 'new');
        assert.strictEqual(bodies[0].get('grant_type'), 'refresh_token');
        assert.strictEqual((await m.getToken()).refresh_token, 'r');
    });
    it('builds PKCE authorize url', () => {
        const { codeVerifier, codeChallenge } = generatePkcePair();
        assert(codeVerifier.length >= 43);
        const u = new URL(getAuthorizationUrl({ clientId: 'c', redirectUri: 'http://127.0.0.1:8888/callback', scopes: ['user-read-email', 'playlist-read-private'], codeChallenge }));
        assert.strictEqual(u.searchParams.get('scope'), 'user-read-email playlist-read-private');
        assert.strictEqual(u.searchParams.get('code_challenge_method'), 'S256');
    });
});

describe('http', () => {
    it('retries 429 honoring Retry-After', async () => {
        let n = 0;
        globalThis.fetch = async () => (++n === 1 ? json({}, 429, { 'Retry-After': '0' }) : json({ ok: 1 }));
        const r = await spotifyFetch('https://api.spotify.com/v1/x');
        assert.deepStrictEqual(await r.json(), { ok: 1 });
        assert.strictEqual(n, 2);
    });
    it('dedupes concurrent identical GETs', async () => {
        let n = 0;
        globalThis.fetch = async () => { n++; await new Promise((r) => setTimeout(r, 10)); return json({ v: 1 }); };
        const opts = { headers: { Authorization: 'Bearer t' } };
        const rs = await Promise.all([spotifyFetch('https://a/x', opts), spotifyFetch('https://a/x', opts)]);
        assert.strictEqual(n, 1);
        for (const r of rs) assert.deepStrictEqual(await r.json(), { v: 1 });
    });
    it('drops undefined query params', async () => {
        let url;
        globalThis.fetch = async (u) => { url = u; return new Response(null, { status: 204 }); };
        const r = await startPlayback('t');
        assert.ok(!url.includes('device_id'));
        assert.strictEqual(r.status, 204);
    });
    it('getAudiobook hits the audiobooks endpoint', async () => {
        let url;
        globalThis.fetch = async (u) => { url = u; return json({}); };
        await getAudiobook('t', 'abc');
        assert.strictEqual(url, 'https://api.spotify.com/v1/audiobooks/abc');
    });
});

describe('SpotifyClient', () => {
    it('auto-mints token and exposes endpoints without accessToken arg', async () => {
        const urls = [];
        globalThis.fetch = async (u, init) => {
            urls.push(u);
            if (u.includes('accounts.spotify.com')) return json({ access_token: 'tok', expires_in: 3600 });
            assert.strictEqual(init.headers.Authorization, 'Bearer tok');
            return json({ id: 'album1' });
        };
        const c = new SpotifyClient({ clientId: 'i', clientSecret: 's' });
        assert.deepStrictEqual(await c.getAlbum('album1'), { id: 'album1' });
        await c.getAlbum('album1');
        assert.strictEqual(urls.filter((u) => u.includes('accounts')).length, 1);
    });
    it('request() throws typed errors', async () => {
        globalThis.fetch = async () => json({ error: { status: 404, message: 'nope' } }, 404);
        const c = new SpotifyClient({ accessToken: 't', http: { maxRetries: 0 } });
        await assert.rejects(c.request('albums/x'), (e) => e instanceof SpotifyApiError && e.status === 404);
    });
    it('getAll follows next links', async () => {
        globalThis.fetch = async (u) => (u.includes('offset=2')
            ? json({ items: [3], next: null })
            : json({ items: [1, 2], next: 'https://api.spotify.com/v1/me/tracks?offset=2' }));
        const c = new SpotifyClient({ accessToken: 't' });
        assert.deepStrictEqual(await c.getAll('me/tracks'), [1, 2, 3]);
        assert.deepStrictEqual(await getAll('t', 'me/tracks', { maxItems: 2 }), [1, 2]);
    });
    it('chunk splits arrays', () => {
        assert.deepStrictEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    });
});
