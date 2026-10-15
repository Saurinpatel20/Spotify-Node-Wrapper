import { describe, it, afterEach } from 'node:test';
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

describe('legacy helpers routed to February 2026 endpoints (3.2.0)', () => {
    const lib2 = lib;
    const cases = [
        ['saveAlbumsForCurrentUser', 'removeUsersSavedAlbums', 'checkUsersSavedAlbums', 'album'],
        ['saveAudiobooksForCurrentUser', 'removeUsersSavedAudiobooks', 'checkUsersSavedAudiobooks', 'audiobook'],
        ['saveEpisodesForCurrentUser', 'removeUsersSavedEpisodes', 'checkUsersSavedEpisodes', 'episode'],
        ['saveShowsForCurrentUser', 'removeUsersSavedShows', 'checkUsersSavedShows', 'show'],
        ['saveTracksForCurrentUser', 'removeUsersSavedTracks', 'checkUsersSavedTracks', 'track'],
    ];
    for (const [save, remove, check, type] of cases) {
        it(`${save}/${remove}/${check} use /me/library with ${type} URIs`, async () => {
            mock(200);
            const r = await lib2[save]('t', ['a', 'b']);
            assert.deepStrictEqual([r.status, calls[0].init.method], [200, 'PUT']);
            assert.strictEqual(new URL(calls[0].url).pathname, '/v1/me/library');
            assert.strictEqual(new URL(calls[0].url).searchParams.get('uris'), `spotify:${type}:a,spotify:${type}:b`);
            const r2 = await lib2[remove]('t', ['a']);
            assert.deepStrictEqual([r2.status, calls[1].init.method], [200, 'DELETE']);
            mock(200, [true, false]);
            assert.deepStrictEqual(await lib2[check]('t', ['a', 'b']), [true, false]);
            assert.strictEqual(new URL(calls[0].url).pathname, '/v1/me/library/contains');
            assert.strictEqual((await lib2[save]('t', [])).status, '400');
        });
    }
    it('chunks more than 40 IDs and concatenates contains results in order', async () => {
        calls = [];
        globalThis.fetch = async (url, init) => {
            calls.push({ url, init });
            const n = new URL(url).searchParams.get('uris').split(',').length;
            return new Response(JSON.stringify(Array.from({ length: n }, (_, i) => i % 2 === 0)), { status: 200 });
        };
        const ids = Array.from({ length: 95 }, (_, i) => `id${i}`);
        const res = await lib.checkUsersSavedTracks('t', ids);
        assert.strictEqual(calls.length, 3);
        assert.strictEqual(res.length, 95);
        mock(200);
        await lib.saveTracksForCurrentUser('t', ids);
        assert.deepStrictEqual(calls.map((c) => new URL(c.url).searchParams.get('uris').split(',').length), [40, 40, 15]);
    });
    it('surfaces Spotify errors from /me/library', async () => {
        mock(403, { error: { status: 403, message: 'Insufficient client scope' } });
        assert.deepStrictEqual(await lib.saveAlbumsForCurrentUser('t', ['a']), { error: { status: 403, message: 'Insufficient client scope' } });
    });
    it('getSeveral* fetch items individually and keep order/shape', async () => {
        calls = [];
        globalThis.fetch = async (url) => {
            calls.push({ url });
            const id = url.split('/').pop();
            return new Response(JSON.stringify(id === 'bad' ? { error: { status: 404 } } : { id }), { status: id === 'bad' ? 404 : 200 });
        };
        lib.configureHttp({ maxRetries: 0 });
        assert.deepStrictEqual(await lib.getSeveralTracks('t', ['x', 'bad', 'y']), { tracks: [{ id: 'x' }, null, { id: 'y' }] });
        assert(calls.every((c) => /\/v1\/tracks\/\w+$/.test(c.url)));
        for (const [fn, key, path] of [['getSeveralAlbums', 'albums', 'albums'], ['getSeveralArtists', 'artists', 'artists'],
            ['getSeveralAudiobooks', 'audiobooks', 'audiobooks'], ['getSeveralChapters', 'chapters', 'chapters'],
            ['getSeveralEpisodes', 'episodes', 'episodes'], ['getSeveralShows', 'shows', 'shows']]) {
            calls = [];
            assert.deepStrictEqual(await lib[fn]('t', ['q']), { [key]: [{ id: 'q' }] });
            assert.strictEqual(calls[0].url, `https://api.spotify.com/v1/${path}/q`);
        }
        lib.configureHttp({ maxRetries: 3 });
    });
    it('follow helpers map IDs to artist/user/playlist URIs', async () => {
        mock(200);
        const artist = '0TnOYISbd1XYRBk9myaseg';
        assert.strictEqual((await lib.followArtistsOrUsers('t', [artist, 'smedjan', 'spotify:user:x'])).status, 204);
        assert.strictEqual(new URL(calls[0].url).searchParams.get('uris'), `spotify:artist:${artist},spotify:user:smedjan,spotify:user:x`);
        await lib.unfollowArtistsOrUsers('t', [artist]);
        assert.strictEqual(calls[1].init.method, 'DELETE');
        assert.strictEqual((await lib.followPlaylist('t', 'pl')).status, 200);
        assert.strictEqual(new URL(calls[2].url).searchParams.get('uris'), 'spotify:playlist:pl');
        assert.strictEqual((await lib.unfollowPlaylist('t', 'pl')).status, 200);
        mock(200, [true]);
        assert.deepStrictEqual(await lib.checkUserFollowsArtistsOrUsers('t', [artist]), [true]);
    });
    it('checkUsersFollowPlaylist answers for the current user', async () => {
        calls = [];
        globalThis.fetch = async (url) => {
            calls.push({ url });
            return new Response(JSON.stringify(url.endsWith('/v1/me') ? { id: 'me1' } : [true]), { status: 200 });
        };
        assert.deepStrictEqual(await lib.checkUsersFollowPlaylist('t', 'pl', ['me1', 'other']), { response: [true, false] });
        assert.match(calls[1].url, /me\/library\/contains\?uris=spotify%3Aplaylist%3Apl$/);
    });
    it('createPlaylist posts to /me/playlists and keeps its return shape', async () => {
        mock(201, { id: 'p' });
        assert.deepStrictEqual(await lib.createPlaylist('t', 'ignored', 'Mix', false, false, 'd'), { status: 201, message: 'Playlist created successfully.' });
        assert.strictEqual(calls[0].url, 'https://api.spotify.com/v1/me/playlists');
        assert.deepStrictEqual(JSON.parse(calls[0].init.body), { name: 'Mix', public: false, collaborative: false, description: 'd' });
    });
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
    it('SpotifyClient exposes new endpoints', async () => {
        mock(200, [true]);
        const c = new lib.SpotifyClient({ accessToken: 't' });
        assert.deepStrictEqual(await c.checkLibraryContains(['spotify:track:x']), [true]);
    });
});
