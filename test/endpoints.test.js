import assert from 'assert';
import * as lib from '../index.js';
import { sections } from '../scripts/endpoints.mjs';

const realFetch = globalThis.fetch;
let calls;
const mock = (status = 200, body = { ok: true }) => {
    calls = [];
    globalThis.fetch = async (url, init = {}) => {
        calls.push({ url, init });
        return new Response(status === 204 ? null : JSON.stringify(body), { status });
    };
};
afterEach(() => { globalThis.fetch = realFetch; });

describe('every documented endpoint', () => {
    const fs = { readFile: async () => Buffer.from('jpg') };
    for (const [section, fns] of Object.entries(sections)) {
        for (const [name, meta] of Object.entries(fns)) {
            it(`${section}.${name} builds a valid request from its README example`, async () => {
                mock();
                const accessToken = 'tok';
                // Evaluate the documented example arguments (and any setup line) exactly as shown in the README.
                const getPlaylist = async () => ({ snapshot_id: 'snap' });
                const getUsersSavedTracks = async () => ({ next: 'https://api.spotify.com/v1/me/tracks?offset=20&limit=20' });
                const setup = meta.argsVar || '';
                const run = new Function('fn', 'accessToken', 'fs', 'getPlaylist', 'getUsersSavedTracks',
                    `return (async () => { ${setup}\n return fn(accessToken${meta.args ? `, ${meta.args}` : ''}); })();`);
                await run(lib[name], accessToken, fs, getPlaylist, getUsersSavedTracks);
                assert(calls.length >= 1, 'made a request');
                const { url, init } = calls[calls.length - 1];
                assert.match(url, /^https:\/\/api\.spotify\.com\/v1\//);
                assert(!/undefined|null/.test(url), `no undefined in ${url}`);
                assert.strictEqual(init.headers.Authorization, 'Bearer tok');
            });
        }
    }
});

describe('new and updated endpoints (3.1.0)', () => {
    it('saveToLibrary / removeFromLibrary / checkLibraryContains use /me/library with uris', async () => {
        const uris = ['spotify:track:a', 'spotify:album:b'];
        mock(200);
        assert.strictEqual((await lib.saveToLibrary('t', uris)).status, 200);
        assert.strictEqual(calls[0].init.method, 'PUT');
        assert.strictEqual(new URL(calls[0].url).searchParams.get('uris'), uris.join(','));
        await lib.removeFromLibrary('t', uris);
        assert.strictEqual(calls[1].init.method, 'DELETE');
        mock(200, [true, false]);
        assert.deepStrictEqual(await lib.checkLibraryContains('t', uris), [true, false]);
        assert.match(calls[0].url, /\/me\/library\/contains\?uris=/);
    });
    it('library helpers validate input', async () => {
        assert.strictEqual((await lib.saveToLibrary('t', [])).status, '400');
        assert.strictEqual((await lib.checkLibraryContains('t', new Array(41).fill('spotify:track:x'))).status, '400');
    });
    it('createPlaylistForCurrentUser posts to /me/playlists', async () => {
        mock(201, { id: 'p1' });
        assert.deepStrictEqual(await lib.createPlaylistForCurrentUser('t', 'Mix', { public: false }), { id: 'p1' });
        assert.strictEqual(calls[0].url, 'https://api.spotify.com/v1/me/playlists');
        assert.deepStrictEqual(JSON.parse(calls[0].init.body), { name: 'Mix', public: false });
    });
    it('playlist item endpoints use /items and the new removal body', async () => {
        mock(200, { items: [] });
        await lib.getPlaylistItems('t', 'p', { limit: 5 });
        assert.strictEqual(calls[0].url, 'https://api.spotify.com/v1/playlists/p/items?limit=5');
        await lib.removePlaylistItems('t', 'p', ['spotify:track:x'], 'snap');
        assert.deepStrictEqual(JSON.parse(calls[1].init.body), { items: [{ uri: 'spotify:track:x' }], snapshot_id: 'snap' });
        mock(201);
        await lib.addItemsToPlaylist('t', 'p', ['spotify:track:x']);
        assert.match(calls[0].url, /playlists\/p\/items$/);
    });
    it('startPlayback sends context/uris/offset', async () => {
        mock(204);
        const r = await lib.startPlayback('t', undefined, { contextUri: 'spotify:album:a', offset: 2, positionMs: 1000 });
        assert.strictEqual(r.status, 204);
        assert.strictEqual(calls[0].url, 'https://api.spotify.com/v1/me/player/play');
        assert.deepStrictEqual(JSON.parse(calls[0].init.body), { context_uri: 'spotify:album:a', offset: { position: 2 }, position_ms: 1000 });
    });
    it('search, top items and artist albums accept options', async () => {
        mock();
        await lib.searchForItem('t', 'a b', ['track'], { limit: 3, market: 'US' });
        assert.strictEqual(calls[0].url, 'https://api.spotify.com/v1/search?q=a%20b&type=track&limit=3&market=US');
        await lib.getUsersTopItems('t', 'tracks', { time_range: 'short_term' });
        assert.strictEqual(calls[1].url, 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term');
        await lib.getArtistsAlbums('t', 'x', { include_groups: 'single' });
        assert.strictEqual(calls[2].url, 'https://api.spotify.com/v1/artists/x/albums?include_groups=single');
    });
    it('saveEpisodesForCurrentUser sends {ids} and handles empty 200 body', async () => {
        mock(200);
        globalThis.fetch = async (url, init) => { calls.push({ url, init }); return new Response('', { status: 200 }); };
        const r = await lib.saveEpisodesForCurrentUser('t', ['e1', 'e2']);
        assert.strictEqual(r.status, 200);
        assert.deepStrictEqual(JSON.parse(calls[0].init.body), { ids: ['e1', 'e2'] });
    });
    it('SpotifyClient exposes new endpoints', async () => {
        mock(200, [true]);
        const c = new lib.SpotifyClient({ accessToken: 't' });
        assert.deepStrictEqual(await c.checkLibraryContains(['spotify:track:x']), [true]);
    });
});
