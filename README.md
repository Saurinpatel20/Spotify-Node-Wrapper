# Spotify Node Wrapper

A small, dependency-free Node.js wrapper for the [Spotify Web API](https://developer.spotify.com/documentation/web-api).
Every endpoint is a plain async function, and a `SpotifyClient` class handles tokens for you: it mints them, caches them, and refreshes them.

- **Zero runtime dependencies.** Uses Node's built-in `fetch` (undici), which keeps connections alive.
- **Easy token minting.** Get a client-credentials token in one call, log in with Authorization Code + PKCE through a local callback server, or refresh tokens automatically.
- **Resilient.** Retries `429 Too Many Requests` after the `Retry-After` delay, and retries transient 5xx and network errors with exponential backoff.
- **Fast.** Identical GET requests that are in flight at the same time share one network call, and pagination helpers stream every page for you.
- **Typed.** Ships with TypeScript declarations (`index.d.ts`).

Requires **Node.js 18+**. ESM only. Up to date with Spotify's February 2026 Web API changes. Removed endpoints transparently use their replacements; see [Endpoints without a replacement](#endpoints-without-a-replacement).

## Installation

```bash
npm install spotify-node-wrapper
```

## Quick start (app-only data)

Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), then set:

```bash
export SPOTIFY_CLIENT_ID=your-client-id
export SPOTIFY_CLIENT_SECRET=your-client-secret
```

```js
import { SpotifyClient } from 'spotify-node-wrapper';

const spotify = new SpotifyClient(); // reads the env vars and mints/refreshes the token itself
const album = await spotify.getAlbum('7ErFctcmAOQiP6xNktc5lX');
const results = await spotify.searchForItem('Daft Punk', ['artist', 'track']);
```

Every endpoint function listed in the [API reference](#api-reference) is also a method on `SpotifyClient`. The only difference is that you leave out the `accessToken` argument.

## Getting tokens

| Need | Use |
| --- | --- |
| Public catalog data (albums, artists, search…) | `getClientCredentialsToken()` or `new SpotifyClient()` |
| User data from a script or CLI | `authorizeWithLocalServer({ scopes })` (PKCE, no secret needed) |
| User data from a web app | `getAuthorizationUrl()` + `exchangeAuthorizationCode()` |
| Keep a user token fresh | `new SpotifyClient({ refreshToken })` or `createTokenManager({ refreshToken })` |

### Client credentials (one call)

```js
import { getClientCredentialsToken, getSpotifyAccessToken } from 'spotify-node-wrapper';

const token = await getClientCredentialsToken();          // { access_token, expires_in, expires_at, ... }
const accessToken = await getSpotifyAccessToken(id, secret); // legacy helper that returns just the string
```

### User login from a script (Authorization Code + PKCE)

Add `http://127.0.0.1:8888/callback` as a Redirect URI in your Spotify app. Then:

```js
import { authorizeWithLocalServer, SpotifyClient } from 'spotify-node-wrapper';

const token = await authorizeWithLocalServer({
  scopes: ['user-read-private', 'playlist-modify-private', 'user-modify-playback-state'],
  onUrl: (url) => console.log('Open:', url), // or open it with the `open` package
});

// Save token.refresh_token somewhere safe, then:
const spotify = new SpotifyClient({ token, onToken: (t) => saveSomewhere(t) });
const me = await spotify.getCurrentUserProfile();
```

### User login from a web app

```js
import { generatePkcePair, getAuthorizationUrl, exchangeAuthorizationCode } from 'spotify-node-wrapper';

const { codeVerifier, codeChallenge } = generatePkcePair(); // store codeVerifier in the session
res.redirect(getAuthorizationUrl({ redirectUri, scopes: ['user-top-read'], state, codeChallenge }));

// In your callback route:
const token = await exchangeAuthorizationCode({ code: req.query.code, redirectUri, codeVerifier });
// A confidential server can pass clientSecret instead of codeVerifier.
```

### Automatic refresh

```js
import { createTokenManager } from 'spotify-node-wrapper';

const tokens = createTokenManager({ refreshToken: process.env.SPOTIFY_REFRESH_TOKEN });
const accessToken = await tokens.getAccessToken(); // cached; refreshed 60s before expiry; concurrent callers share one refresh
```

`SpotifyClient` also retries a request once with a new token if Spotify returns `401`.

## Environment variables

| Variable | Used for |
| --- | --- |
| `SPOTIFY_CLIENT_ID` (or `CLIENT_ID`) | All flows |
| `SPOTIFY_CLIENT_SECRET` (or `CLIENT_SECRET`) | Client credentials, confidential auth-code, and refresh |
| `SPOTIFY_REDIRECT_URI` (or `REDIRECT_URI`) | Authorization code flows |
| `SPOTIFY_REFRESH_TOKEN` | Default refresh token for `createTokenManager` and `SpotifyClient` |

Never commit these values. Keep them in a `.env` file, which `.gitignore` excludes, or in your secret manager.

## Pagination

```js
// Iterate lazily over every saved track (follows `next` links, 50 per page)
for await (const item of spotify.paginate('me/tracks')) console.log(item.track.name);

// Or collect everything (optionally capped)
const playlists = await spotify.getAll('me/playlists', { maxItems: 200 });

// Also works with a page you already fetched, including nested search results
const first = await spotify.searchForItem('lofi', ['playlist']);
const all = await spotify.getAll(first);

// Bulk endpoints accept a limited number of IDs per call
import { chunk } from 'spotify-node-wrapper';
for (const ids of chunk(trackIds, 50)) await spotify.saveTracksForCurrentUser(ids);
```

## Raw requests

Use this for any endpoint that doesn't have a helper yet:

```js
const data = await spotify.request('me/top/artists', { query: { time_range: 'short_term', limit: 10 } });
await spotify.request('me/player/volume', { method: 'PUT', query: { volume_percent: 40 } });
// Functional form:
import { spotifyRequest } from 'spotify-node-wrapper';
await spotifyRequest(accessToken, 'playlists/abc', { method: 'PUT', body: { name: 'New name' } });
```

## Configuration

```js
import { configureHttp } from 'spotify-node-wrapper';

configureHttp({
  maxRetries: 3,          // retries for 429 / 5xx / network errors
  retryBaseDelayMs: 500,  // exponential backoff base (used when there is no Retry-After header)
  maxRetryDelayMs: 30000, // longest single wait
  dedupe: true,           // share identical in-flight GET requests
});
// or: new SpotifyClient({ http: { maxRetries: 5 } })
```

## Error handling

`SpotifyClient` methods `request`, `paginate`, and `getAll`, plus `spotifyRequest` and all token helpers, throw a `SpotifyApiError` when a response is not 2xx:

```js
import { SpotifyApiError } from 'spotify-node-wrapper';

try {
  await spotify.request('albums/does-not-exist');
} catch (e) {
  if (e instanceof SpotifyApiError) console.error(e.status, e.body?.error?.message, e.url);
}
```

The original endpoint helpers, such as `getAlbum`, keep their 2.x behavior for backward compatibility. They resolve with Spotify's JSON body, which holds an `error` object on failure. Mutation endpoints resolve with `{ status, message }`, and input checks (for example, too many IDs) also resolve with `{ status: "400", message }`.

## Functional API

Every helper takes the access token as its first argument:

```js
import { getClientCredentialsToken, getAlbum } from 'spotify-node-wrapper';
const { access_token } = await getClientCredentialsToken();
const album = await getAlbum(access_token, '7ErFctcmAOQiP6xNktc5lX');
```

## Development

```bash
npm install
npm run lint
npm test   # fully offline: all HTTP calls are mocked
```

## API Reference

This reference is generated by `npm run docs` and covers all 93 endpoint helpers. Each helper is available two ways:

- **Function form:** `fn(accessToken, ...args)`
- **Client form:** `spotify.fn(...args)`, where `spotify = new SpotifyClient(...)`. The client mints and refreshes the token for you.

**Scopes** lists the OAuth scopes the user must grant. "None" means any token works, including a client-credentials token. Endpoints that need a user (`me/...`) require an Authorization Code or PKCE token.

Entries marked *Requires Spotify extended quota mode* are listed in [Endpoints without a replacement](#endpoints-without-a-replacement).

- [Albums](#albums)
- [Artists](#artists)
- [Audiobooks](#audiobooks)
- [Categories](#categories)
- [Chapters](#chapters)
- [Episodes](#episodes)
- [Genres](#genres)
- [Library](#library)
- [Markets](#markets)
- [Pagination](#pagination)
- [Player](#player)
- [Playlists](#playlists)
- [Search](#search)
- [Shows](#shows)
- [Tracks](#tracks)
- [Users](#users)

### Albums

#### getAlbum

Get Spotify catalog information for a single album.

- **Scopes:** None
- **Returns:** Album object (`id`, `name`, `artists`, `images`, `release_date`, `tracks` page, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `albumID` | `string` | The ID of the album to retrieve information for. |

```js
// Function form
const result = await getAlbum(accessToken, '4aawyAB9vmqN3uQ7FjRGTy');

// Client form
const result2 = await spotify.getAlbum('4aawyAB9vmqN3uQ7FjRGTy');
```

#### getSeveralAlbums

Get Spotify catalog information for multiple albums identified by their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ albums: Album[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAlbumID` | `string[]` | An array of Spotify IDs representing the albums to retrieve information for. |

```js
// Function form
const result = await getSeveralAlbums(accessToken, ['4aawyAB9vmqN3uQ7FjRGTy', '1A2GTWGtFfWp7KSQTwWOyo']);

// Client form
const result2 = await spotify.getSeveralAlbums(['4aawyAB9vmqN3uQ7FjRGTy', '1A2GTWGtFfWp7KSQTwWOyo']);
```

#### getAlbumTracks

Get Spotify catalog information about an album’s tracks.

- **Scopes:** None
- **Returns:** Paging object of simplified Track objects (`items`, `next`, `total`)

| Parameter | Type | Description |
| --- | --- | --- |
| `albumID` | `string` | An album ID representing the album to retrieve information for. |

```js
// Function form
const result = await getAlbumTracks(accessToken, '4aawyAB9vmqN3uQ7FjRGTy');

// Client form
const result2 = await spotify.getAlbumTracks('4aawyAB9vmqN3uQ7FjRGTy');
```

#### getUsersSavedAlbums

Get a list of the albums saved in the current Spotify user’s ‘Your Music’ library.

- **Scopes:** `user-library-read`
- **Returns:** Paging object of `{ added_at, album }`

```js
// Function form
const result = await getUsersSavedAlbums(accessToken);

// Client form
const result2 = await spotify.getUsersSavedAlbums();
```

#### saveAlbumsForCurrentUser

Save one or more albums to the current user’s ‘Your Music’ library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAlbumID` | `string[]` | An array of Spotify IDs representing the albums to retrieve information for. |

```js
// Function form
const result = await saveAlbumsForCurrentUser(accessToken, ['4aawyAB9vmqN3uQ7FjRGTy']);

// Client form
const result2 = await spotify.saveAlbumsForCurrentUser(['4aawyAB9vmqN3uQ7FjRGTy']);
```

#### removeUsersSavedAlbums

Remove one or more albums from the current user’s ‘Your Music’ library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAlbumID` | `string[]` | An array of Spotify IDs representing the albums to retrieve information for. |

```js
// Function form
const result = await removeUsersSavedAlbums(accessToken, ['4aawyAB9vmqN3uQ7FjRGTy']);

// Client form
const result2 = await spotify.removeUsersSavedAlbums(['4aawyAB9vmqN3uQ7FjRGTy']);
```

#### checkUsersSavedAlbums

Check if one or more albums is already saved in the current Spotify user’s ‘Your Music’ library.

- **Scopes:** `user-library-read`
- **Returns:** `boolean[]` in the same order as the IDs

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAlbumID` | `string[]` | An array of Spotify IDs representing the albums to retrieve information for. |

```js
// Function form
const result = await checkUsersSavedAlbums(accessToken, ['4aawyAB9vmqN3uQ7FjRGTy']);

// Client form
const result2 = await spotify.checkUsersSavedAlbums(['4aawyAB9vmqN3uQ7FjRGTy']);
```

#### getNewReleases

Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ albums: Paging<Album> }`

```js
// Function form
const result = await getNewReleases(accessToken);

// Client form
const result2 = await spotify.getNewReleases();
```

### Artists

#### getArtist

Get Spotify catalog information for a single artist identified by their unique Spotify ID.

- **Scopes:** None
- **Returns:** Artist object (`id`, `name`, `genres`, `images`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `artistID` | `string` | The ID of the artist to retrieve information for. |

```js
// Function form
const result = await getArtist(accessToken, '0TnOYISbd1XYRBk9myaseg');

// Client form
const result2 = await spotify.getArtist('0TnOYISbd1XYRBk9myaseg');
```

#### getSeveralArtists

Get Spotify catalog information for several artists based on their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ artists: Artist[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfArtistID` | `string[]` | An array of Spotify IDs representing the artists to retrieve information for. |

```js
// Function form
const result = await getSeveralArtists(accessToken, ['0TnOYISbd1XYRBk9myaseg', '3dBVyJ7JuOMt4GE9607Qin']);

// Client form
const result2 = await spotify.getSeveralArtists(['0TnOYISbd1XYRBk9myaseg', '3dBVyJ7JuOMt4GE9607Qin']);
```

#### getArtistsAlbums

Get Spotify catalog information about an artist’s albums. Optional parameters can be specified in the query string to filter and sort the response.

- **Scopes:** None
- **Returns:** Paging object of simplified Album objects. Optional query: `include_groups`, `market`, `limit`, `offset`

| Parameter | Type | Description |
| --- | --- | --- |
| `artistID` | `string` | The Spotify ID for the artist. |
| `query` *(optional)* | `any` |  |

```js
// Function form
const result = await getArtistsAlbums(accessToken, '0TnOYISbd1XYRBk9myaseg', { include_groups: 'album,single', limit: 10 });

// Client form
const result2 = await spotify.getArtistsAlbums('0TnOYISbd1XYRBk9myaseg', { include_groups: 'album,single', limit: 10 });
```

#### getArtistTopTracks

Get Spotify catalog information about an artist’s top tracks by country.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ tracks: Track[] }`

| Parameter | Type | Description |
| --- | --- | --- |
| `artistID` | `string` | The Spotify ID for the artist. |
| `countryCode` | `string` | The country: an ISO 3166-1 alpha-2 country code. |

```js
// Function form
const result = await getArtistTopTracks(accessToken, '0TnOYISbd1XYRBk9myaseg', 'US');

// Client form
const result2 = await spotify.getArtistTopTracks('0TnOYISbd1XYRBk9myaseg', 'US');
```

#### getArtistsRelatedArtists

Get Spotify catalog information about artists similar to a given artist. Similarity is based on analysis of the Spotify community’s listening history.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ artists: Artist[] }`

| Parameter | Type | Description |
| --- | --- | --- |
| `artistID` | `string` | The Spotify ID for the artist. |

```js
// Function form
const result = await getArtistsRelatedArtists(accessToken, '0TnOYISbd1XYRBk9myaseg');

// Client form
const result2 = await spotify.getArtistsRelatedArtists('0TnOYISbd1XYRBk9myaseg');
```

### Audiobooks

#### getAudiobook

Get Spotify catalog information for a single audiobook identified by their unique Spotify ID.

- **Scopes:** None
- **Returns:** Audiobook object (`id`, `name`, `authors`, `narrators`, `chapters` page, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `audiobookID` | `string` | The ID of the audiobook to retrieve information for. |

```js
// Function form
const result = await getAudiobook(accessToken, '7iHfbu1YPACw6oZPAFJtqe');

// Client form
const result2 = await spotify.getAudiobook('7iHfbu1YPACw6oZPAFJtqe');
```

#### getSeveralAudiobooks

Get Spotify catalog information for several audiobooks based on their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ audiobooks: Audiobook[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAudiobookID` | `string[]` | An array of Spotify IDs representing the audiobooks to retrieve information for. |

```js
// Function form
const result = await getSeveralAudiobooks(accessToken, ['7iHfbu1YPACw6oZPAFJtqe']);

// Client form
const result2 = await spotify.getSeveralAudiobooks(['7iHfbu1YPACw6oZPAFJtqe']);
```

#### getAudiobookChapters

Get Spotify catalog information about an audiobook’s tracks.

- **Scopes:** None
- **Returns:** Paging object of simplified Chapter objects

| Parameter | Type | Description |
| --- | --- | --- |
| `audiobookID` | `string` | The ID of the audiobook to retrieve information for. |

```js
// Function form
const result = await getAudiobookChapters(accessToken, '7iHfbu1YPACw6oZPAFJtqe');

// Client form
const result2 = await spotify.getAudiobookChapters('7iHfbu1YPACw6oZPAFJtqe');
```

#### getUsersSavedAudiobooks

Get spotify catalog information about a user's saved audiobooks.

- **Scopes:** `user-library-read`
- **Returns:** Paging object of simplified Audiobook objects

```js
// Function form
const result = await getUsersSavedAudiobooks(accessToken);

// Client form
const result2 = await spotify.getUsersSavedAudiobooks();
```

#### saveAudiobooksForCurrentUser

Save one or more audiobooks to the current user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAudiobookID` | `string[]` | An array of Spotify IDs representing the audiobooks to save. |

```js
// Function form
const result = await saveAudiobooksForCurrentUser(accessToken, ['7iHfbu1YPACw6oZPAFJtqe']);

// Client form
const result2 = await spotify.saveAudiobooksForCurrentUser(['7iHfbu1YPACw6oZPAFJtqe']);
```

#### removeUsersSavedAudiobooks

Remove one or more audiobooks from the current user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAudiobookID` | `string[]` | An array of Spotify IDs representing the audiobooks to remove. |

```js
// Function form
const result = await removeUsersSavedAudiobooks(accessToken, ['7iHfbu1YPACw6oZPAFJtqe']);

// Client form
const result2 = await spotify.removeUsersSavedAudiobooks(['7iHfbu1YPACw6oZPAFJtqe']);
```

#### checkUsersSavedAudiobooks

Check if one or more audiobooks is already saved in the current Spotify user’s ‘Your Music’ library.

- **Scopes:** `user-library-read`
- **Returns:** `boolean[]` in input order

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfAudiobookID` | `string[]` | An array of Spotify IDs representing the audiobooks to check. |

```js
// Function form
const result = await checkUsersSavedAudiobooks(accessToken, ['7iHfbu1YPACw6oZPAFJtqe']);

// Client form
const result2 = await spotify.checkUsersSavedAudiobooks(['7iHfbu1YPACw6oZPAFJtqe']);
```

### Categories

#### getSeveralBrowseCategories

Get a list of categories used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab).

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ categories: Paging<Category> }`

```js
// Function form
const result = await getSeveralBrowseCategories(accessToken);

// Client form
const result2 = await spotify.getSeveralBrowseCategories();
```

#### getSingleBrowseCategory

Get a single category used to tag items in Spotify (on, for example, the Spotify player's "Browse" tab).

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** Category object (`id`, `name`, `icons`)

| Parameter | Type | Description |
| --- | --- | --- |
| `categoryID` | `string` | The ID of the category to retrieve information for. |

```js
// Function form
const result = await getSingleBrowseCategory(accessToken, 'dinner');

// Client form
const result2 = await spotify.getSingleBrowseCategory('dinner');
```

### Chapters

#### getSingleChapter

Get Spotify catalog information for a single chapter identified by their unique Spotify ID.

- **Scopes:** None
- **Returns:** Chapter object (`id`, `name`, `duration_ms`, `audiobook`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `chapterID` | `string` | The ID of the chapter to retrieve information for. |

```js
// Function form
const result = await getSingleChapter(accessToken, '0D5wENdkdwbqlrHoaJ9g29');

// Client form
const result2 = await spotify.getSingleChapter('0D5wENdkdwbqlrHoaJ9g29');
```

#### getSeveralChapters

Get Spotify catalog information for several chapters based on their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ chapters: Chapter[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfChapterID` | `string[]` | An array of Spotify IDs representing the chapters to retrieve information for. |

```js
// Function form
const result = await getSeveralChapters(accessToken, ['0D5wENdkdwbqlrHoaJ9g29']);

// Client form
const result2 = await spotify.getSeveralChapters(['0D5wENdkdwbqlrHoaJ9g29']);
```

### Episodes

#### getEpisode

Get Spotify catalog information for a single episode identified by their unique Spotify ID.

- **Scopes:** `user-read-playback-position (optional, for resume_point)`
- **Returns:** Episode object (`id`, `name`, `description`, `duration_ms`, `show`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `episodeID` | `string` | The ID of the episode to retrieve information for. |

```js
// Function form
const result = await getEpisode(accessToken, '512ojhOuo1ktJprKbVcKyQ');

// Client form
const result2 = await spotify.getEpisode('512ojhOuo1ktJprKbVcKyQ');
```

#### getSeveralEpisodes

Get Spotify catalog information for several episodes based on their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ episodes: Episode[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfEpisodeID` | `string[]` | An array of Spotify IDs representing the episodes to retrieve information for. |

```js
// Function form
const result = await getSeveralEpisodes(accessToken, ['512ojhOuo1ktJprKbVcKyQ']);

// Client form
const result2 = await spotify.getSeveralEpisodes(['512ojhOuo1ktJprKbVcKyQ']);
```

#### getUsersSavedEpisodes

Get a list of episodes the user has saved in their Spotify library.

- **Scopes:** `user-library-read`
- **Returns:** Paging object of `{ added_at, episode }`

```js
// Function form
const result = await getUsersSavedEpisodes(accessToken);

// Client form
const result2 = await spotify.getUsersSavedEpisodes();
```

#### saveEpisodesForCurrentUser

Save one or more episodes to the user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfEpisodeID` | `string[]` | An array of Spotify IDs representing the episodes to save. |

```js
// Function form
const result = await saveEpisodesForCurrentUser(accessToken, ['512ojhOuo1ktJprKbVcKyQ']);

// Client form
const result2 = await spotify.saveEpisodesForCurrentUser(['512ojhOuo1ktJprKbVcKyQ']);
```

#### removeUsersSavedEpisodes

Remove one or more episodes from the user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfEpisodeID` | `string[]` | An array of Spotify IDs representing the episodes to remove. |

```js
// Function form
const result = await removeUsersSavedEpisodes(accessToken, ['512ojhOuo1ktJprKbVcKyQ']);

// Client form
const result2 = await spotify.removeUsersSavedEpisodes(['512ojhOuo1ktJprKbVcKyQ']);
```

#### checkUsersSavedEpisodes

Check if one or more episodes is already saved in the current Spotify user's library.

- **Scopes:** `user-library-read`
- **Returns:** `boolean[]` in input order

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfEpisodeID` | `string[]` | An array of Spotify IDs representing the episodes to check. |

```js
// Function form
const result = await checkUsersSavedEpisodes(accessToken, ['512ojhOuo1ktJprKbVcKyQ']);

// Client form
const result2 = await spotify.checkUsersSavedEpisodes(['512ojhOuo1ktJprKbVcKyQ']);
```

### Genres

#### getAvailableGenreSeeds

Get a list of available genre seeds for recommendations.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ genres: string[] }`

```js
// Function form
const result = await getAvailableGenreSeeds(accessToken);

// Client form
const result2 = await spotify.getAvailableGenreSeeds();
```

### Library

#### saveToLibrary

Save items (tracks, albums, episodes, shows, audiobooks) or follow users/playlists, by Spotify URI. Uses `PUT /me/library` (added February 2026; replaces the per-type save/follow endpoints).

> New in 3.1.0

- **Scopes:** `user-library-modify (tracks/albums/episodes/shows/audiobooks), user-follow-modify (users), playlist-modify-public/private (playlists)`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `uris` | `string[]` | Up to 40 Spotify URIs, e.g. `spotify:track:...`, `spotify:album:...`, `spotify:playlist:...`. |

```js
// Function form
const result = await saveToLibrary(accessToken, ['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:album:4aawyAB9vmqN3uQ7FjRGTy']);

// Client form
const result2 = await spotify.saveToLibrary(['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:album:4aawyAB9vmqN3uQ7FjRGTy']);
```

#### removeFromLibrary

Remove items from the library or unfollow users/playlists, by Spotify URI (`DELETE /me/library`).

> New in 3.1.0

- **Scopes:** `Same as saveToLibrary`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `uris` | `string[]` | Up to 40 Spotify URIs. |

```js
// Function form
const result = await removeFromLibrary(accessToken, ['spotify:track:11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.removeFromLibrary(['spotify:track:11dFghVXANMlKmJXsNCbNl']);
```

#### checkLibraryContains

Check whether items are saved/followed in the current user's library (`GET /me/library/contains`).

> New in 3.1.0

- **Scopes:** `user-library-read and/or user-follow-read`
- **Returns:** `boolean[]` in the same order as the URIs (max 40)

| Parameter | Type | Description |
| --- | --- | --- |
| `uris` | `string[]` | Up to 40 Spotify URIs. |

```js
// Function form
const result = await checkLibraryContains(accessToken, ['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:artist:0TnOYISbd1XYRBk9myaseg']);

// Client form
const result2 = await spotify.checkLibraryContains(['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:artist:0TnOYISbd1XYRBk9myaseg']);
```

### Markets

#### getAvailableMarkets

Get a list of available markets for tracks.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ markets: string[] }` (ISO 3166-1 alpha-2 codes)

```js
// Function form
const result = await getAvailableMarkets(accessToken);

// Client form
const result2 = await spotify.getAvailableMarkets();
```

### Pagination

#### getNext

Get the next item from the Spotify API using the next URL parameter

- **Scopes:** `Whatever the original endpoint needed`
- **Returns:** The next Paging object. Prefer `paginate` / `getAll` for full iteration

| Parameter | Type | Description |
| --- | --- | --- |
| `nextURL` | `string` | The next URL to fetch the next item from the Spotify API |

```js
const page = await getUsersSavedTracks(accessToken); // page.next is e.g. 'https://api.spotify.com/v1/me/tracks?offset=20&limit=20'
// Function form
const result = await getNext(accessToken, page.next);

// Client form
const result2 = await spotify.getNext(page.next);
```

### Player

#### getPlaybackState

Get information about the user's current playback state, including track, track progress, and active device.

- **Scopes:** `user-read-playback-state`
- **Returns:** Playback state (`device`, `is_playing`, `progress_ms`, `item`, `shuffle_state`, `repeat_state`). Body is empty (204) when nothing is playing

```js
// Function form
const result = await getPlaybackState(accessToken);

// Client form
const result2 = await spotify.getPlaybackState();
```

#### transferPlayback

Transfer the user's playback to a new device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when transferred

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device to transfer playback to. |

```js
// Function form
const result = await transferPlayback(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.transferPlayback('0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### getAvailableDevices

Get information about the user's currently available devices.

- **Scopes:** `user-read-playback-state`
- **Returns:** `{ devices: Device[] }` (`id`, `name`, `type`, `is_active`, `volume_percent`)

```js
// Function form
const result = await getAvailableDevices(accessToken);

// Client form
const result2 = await spotify.getAvailableDevices();
```

#### getCurrentlyPlayingTrack

Get the user's current playback, including track, track progress, and active device.

- **Scopes:** `user-read-currently-playing`
- **Returns:** Currently-playing object (`item`, `progress_ms`, `is_playing`, `currently_playing_type`)

```js
// Function form
const result = await getCurrentlyPlayingTrack(accessToken);

// Client form
const result2 = await spotify.getCurrentlyPlayingTrack();
```

#### startPlayback

Starts the playback on the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when started. Omit deviceID to use the active device; pass `{ uris: [...] }` to play specific tracks

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device. Omit to use the active device. |
| `playOptions` *(optional)* | `{contextUri?:string, uris?:string[], offset?:number\|{position?:number,uri?:string}, positionMs?:number}` | What to play. |

```js
// Function form
const result = await startPlayback(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8', { contextUri: 'spotify:album:4aawyAB9vmqN3uQ7FjRGTy', offset: 2, positionMs: 0 });

// Client form
const result2 = await spotify.startPlayback('0d1841b0976bae2a3a310dd74c0f3df354899bc8', { contextUri: 'spotify:album:4aawyAB9vmqN3uQ7FjRGTy', offset: 2, positionMs: 0 });
```

#### pausePlayback

Pauses the playback on the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when paused

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await pausePlayback(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.pausePlayback('0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### skipToNextTrack

Skips to the next track in the queue for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when skipped. Omit deviceID to target the active device

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await skipToNextTrack(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.skipToNextTrack('0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### skipToPreviousTrack

Skips to the previous track in the queue for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when skipped back

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await skipToPreviousTrack(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.skipToPreviousTrack('0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### seekToPosition

Seeks to the specified position in the currently playing track for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when seeked (positionMs in milliseconds)

| Parameter | Type | Description |
| --- | --- | --- |
| `deviceID` *(optional)* | `string` | The ID of the device |
| `positionMs` | `number` | The position in milliseconds to seek to. Must be a positive number. |

```js
// Function form
const result = await seekToPosition(accessToken, '0d1841b0976bae2a3a310dd74c0f3df354899bc8', 30000);

// Client form
const result2 = await spotify.seekToPosition('0d1841b0976bae2a3a310dd74c0f3df354899bc8', 30000);
```

#### setRepeatMode

Sets the repeat mode for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when set. state is 'track', 'context' or 'off'

| Parameter | Type | Description |
| --- | --- | --- |
| `state` | `string` | The state of the repeat mode. Must be one of 'context', 'track', or 'off'. |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await setRepeatMode(accessToken, 'context', '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.setRepeatMode('context', '0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### setPlaybackVolume

Sets the volume for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when set (0–100)

| Parameter | Type | Description |
| --- | --- | --- |
| `volumePercent` | `number` | The volume percentage to set. Must be a number between 0 and 100. |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await setPlaybackVolume(accessToken, 50, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.setPlaybackVolume(50, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### togglePlaybackShuffle

Toggles shuffle mode for the specified device.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when toggled

| Parameter | Type | Description |
| --- | --- | --- |
| `state` | `boolean` | The state of the shuffle mode. Must be either 'true' or 'false'. |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await togglePlaybackShuffle(accessToken, true, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.togglePlaybackShuffle(true, '0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

#### getRecentlyPlayedTracks

Get the recently played tracks from the playback queue.

- **Scopes:** `user-read-recently-played`
- **Returns:** Cursor-paged object of `{ track, played_at, context }`

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` *(optional)* | `number` | The number of tracks to return. Must be between 1 and 50. |
| `before` *(optional)* | `number` | A Unix timestamp in milliseconds. Returns all tracks played before this timestamp. Must be before the current time. |
| `after` *(optional)* | `number` | A Unix timestamp in milliseconds. Returns all tracks played after this timestamp. Must be before the current time. |

```js
// Function form
const result = await getRecentlyPlayedTracks(accessToken, 20, undefined, Date.now() - 86400000);

// Client form
const result2 = await spotify.getRecentlyPlayedTracks(20, undefined, Date.now() - 86400000);
```

#### getUserQueue

Get the user's playback queue.

- **Scopes:** `user-read-currently-playing, user-read-playback-state`
- **Returns:** `{ currently_playing, queue: (Track|Episode)[] }`

```js
// Function form
const result = await getUserQueue(accessToken);

// Client form
const result2 = await spotify.getUserQueue();
```

#### addItemToPlaybackQueue

Adds an item to the user's playback queue.

> Requires Spotify Premium

- **Scopes:** `user-modify-playback-state`
- **Returns:** `{ status: 204, message }` when queued

| Parameter | Type | Description |
| --- | --- | --- |
| `uri` | `string` | The URI of the item to add to the playback queue. |
| `deviceID` *(optional)* | `string` | The ID of the device |

```js
// Function form
const result = await addItemToPlaybackQueue(accessToken, 'spotify:track:11dFghVXANMlKmJXsNCbNl', '0d1841b0976bae2a3a310dd74c0f3df354899bc8');

// Client form
const result2 = await spotify.addItemToPlaybackQueue('spotify:track:11dFghVXANMlKmJXsNCbNl', '0d1841b0976bae2a3a310dd74c0f3df354899bc8');
```

### Playlists

#### getPlaylist

Get the playlist with the specified playlist ID

- **Scopes:** `playlist-read-private (for private playlists)`
- **Returns:** Playlist object. Since Feb 2026 `items` (formerly `tracks`) is only included for playlists you own or collaborate on

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to be retrieved |

```js
// Function form
const result = await getPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n');

// Client form
const result2 = await spotify.getPlaylist('3cEYpjA9oz9GiPac4AsH4n');
```

#### changePlaylistDetails

Change the details of a playlist to the specified information.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 200, message }` when updated

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to be updated. |
| `name` *(optional)* | `string` | The new name of the playlist. |
| `isPublic` *(optional)* | `boolean` | Whether the playlist should be public or not. |
| `isCollaborative` *(optional)* | `boolean` | Whether the playlist should be collaborative or not. |
| `description` *(optional)* | `string` | The new description of the playlist. |

```js
// Function form
const result = await changePlaylistDetails(accessToken, '3cEYpjA9oz9GiPac4AsH4n', 'Road trip', false, false, 'Songs for the drive');

// Client form
const result2 = await spotify.changePlaylistDetails('3cEYpjA9oz9GiPac4AsH4n', 'Road trip', false, false, 'Songs for the drive');
```

#### getPlaylistItems

Get the items in the playlist with the specified playlist ID.

- **Scopes:** `playlist-read-private`
- **Returns:** Paging object of playlist items (`items[].item`, `added_at`). Uses `GET /playlists/{id}/items`

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to get the items of. |
| `query` *(optional)* | `{market?:string, fields?:string, limit?:number, offset?:number, additional_types?:string}` | Optional query parameters. |

```js
// Function form
const result = await getPlaylistItems(accessToken, '3cEYpjA9oz9GiPac4AsH4n', { limit: 50, fields: 'items(item(name,uri)),next' });

// Client form
const result2 = await spotify.getPlaylistItems('3cEYpjA9oz9GiPac4AsH4n', { limit: 50, fields: 'items(item(name,uri)),next' });
```

#### updatePlaylistItems

Update the items in the playlist with the specified playlist ID.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 200, message }` when reordered/replaced. Pass `uris` to replace all items, or rangeStart/insertBefore/rangeLength to reorder

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to update the items of. |
| `uris` *(optional)* | `string[]` | An array of Spotify track URIs to add to the playlist. |
| `rangeStart` *(optional)* | `number` | The position of the first item to replace. |
| `insertBefore` *(optional)* | `number` | The position where the new items should be inserted. |
| `rangeLength` *(optional)* | `number` | The number of items to be replaced. |
| `snapshotID` *(optional)* | `string` | The playlist's snapshot ID against which you want to make the changes. |

```js
// Move the first 2 items so they sit before position 5
const { snapshot_id: snapshotId } = await getPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n');
// Function form
const result = await updatePlaylistItems(accessToken, '3cEYpjA9oz9GiPac4AsH4n', undefined, 0, 5, 2, snapshotId);

// Client form
const result2 = await spotify.updatePlaylistItems('3cEYpjA9oz9GiPac4AsH4n', undefined, 0, 5, 2, snapshotId);
```

#### addItemsToPlaylist

Add items to the playlist with the specified playlist ID.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 201, message }` when added (1–100 URIs; throws on invalid count)

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to update the items of. |
| `uris` | `string[]` | An array of Spotify track URIs to add to the playlist. |
| `position` *(optional)* | `number` | The position where the new items should be inserted. |

```js
// Function form
const result = await addItemsToPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n', ['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:episode:512ojhOuo1ktJprKbVcKyQ'], 0);

// Client form
const result2 = await spotify.addItemsToPlaylist('3cEYpjA9oz9GiPac4AsH4n', ['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:episode:512ojhOuo1ktJprKbVcKyQ'], 0);
```

#### removePlaylistItems

Remove items from the playlist with the specified playlist ID.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 200, message }` when removed. snapshotID is optional

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to update the items of. |
| `uris` | `string[]` | An array of Spotify track URIs to add to the playlist. |
| `snapshotID` *(optional)* | `string` | The playlist's snapshot ID against which you want to make the changes. |

```js
// Function form
const result = await removePlaylistItems(accessToken, '3cEYpjA9oz9GiPac4AsH4n', ['spotify:track:11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.removePlaylistItems('3cEYpjA9oz9GiPac4AsH4n', ['spotify:track:11dFghVXANMlKmJXsNCbNl']);
```

#### getCurrentUserPlaylists

Get a list of the current user's playlists.

- **Scopes:** `playlist-read-private, playlist-read-collaborative`
- **Returns:** Paging object of simplified Playlist objects

```js
// Function form
const result = await getCurrentUserPlaylists(accessToken);

// Client form
const result2 = await spotify.getCurrentUserPlaylists();
```

#### getUserPlaylists

Get a list of the current user's playlists.

> Requires Spotify extended quota mode

- **Scopes:** `playlist-read-private, playlist-read-collaborative`
- **Returns:** Paging object of simplified Playlist objects

| Parameter | Type | Description |
| --- | --- | --- |
| `userID` | `string` | The ID of the user whose playlists are to be retrieved. |

```js
// Function form
const result = await getUserPlaylists(accessToken, 'smedjan');

// Client form
const result2 = await spotify.getUserPlaylists('smedjan');
```

#### createPlaylist

Create a new playlist for the current user.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 201, message }` when created

| Parameter | Type | Description |
| --- | --- | --- |
| `userID` | `string` | Ignored since February 2026: playlists are always created for the authenticated user. |
| `name` | `string` | The name of the playlist. |
| `isPublic` *(optional)* | `boolean` | Whether the playlist should be public or not. |
| `isCollaborative` *(optional)* | `boolean` | Whether the playlist should be collaborative or not. |
| `description` *(optional)* | `string` | A description of the playlist. |

```js
// Function form
const result = await createPlaylist(accessToken, 'your-user-id', 'New Playlist', false, false, 'Made with spotify-node-wrapper');

// Client form
const result2 = await spotify.createPlaylist('your-user-id', 'New Playlist', false, false, 'Made with spotify-node-wrapper');
```

#### createPlaylistForCurrentUser

Create a playlist for the current user (`POST /me/playlists`). Replaces `createPlaylist`, which used the removed `/users/{id}/playlists` endpoint.

> New in 3.1.0

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** The created Playlist object (`id`, `uri`, `snapshot_id`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the playlist. |
| `details` *(optional)* | `{public?:boolean, collaborative?:boolean, description?:string}` | Optional playlist details. |

```js
// Function form
const result = await createPlaylistForCurrentUser(accessToken, 'New Playlist', { public: false, description: 'Made with spotify-node-wrapper' });

// Client form
const result2 = await spotify.createPlaylistForCurrentUser('New Playlist', { public: false, description: 'Made with spotify-node-wrapper' });
```

#### getFeaturedPlaylists

Get an object consisting of Spotify featured playlists.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ message, playlists: Paging<Playlist> }`

```js
// Function form
const result = await getFeaturedPlaylists(accessToken);

// Client form
const result2 = await spotify.getFeaturedPlaylists();
```

#### getCategoryPlaylists

Get a list of Spotify category playlists.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ message, playlists: Paging<Playlist> }`

| Parameter | Type | Description |
| --- | --- | --- |
| `categoryID` | `string` | The ID of the category to get playlists for. |

```js
// Function form
const result = await getCategoryPlaylists(accessToken, 'dinner');

// Client form
const result2 = await spotify.getCategoryPlaylists('dinner');
```

#### getPlaylistCoverImage

Get the playlist cover image given the ID.

- **Scopes:** None
- **Returns:** `Image[]` (`url`, `height`, `width`)

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to get the cover image for. |

```js
// Function form
const result = await getPlaylistCoverImage(accessToken, '3cEYpjA9oz9GiPac4AsH4n');

// Client form
const result2 = await spotify.getPlaylistCoverImage('3cEYpjA9oz9GiPac4AsH4n');
```

#### addCustomPlaylistCoverImage

Add a custom cover image to a playlist.

- **Scopes:** `ugc-image-upload, playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 202, message }` when accepted

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistID` | `string` | The ID of the playlist to add the cover image to. |
| `image` | `string` | The image to use as the cover image. |

```js
const base64Jpeg = (await fs.readFile('cover.jpg')).toString('base64'); // max 256 KB
// Function form
const result = await addCustomPlaylistCoverImage(accessToken, '3cEYpjA9oz9GiPac4AsH4n', base64Jpeg);

// Client form
const result2 = await spotify.addCustomPlaylistCoverImage('3cEYpjA9oz9GiPac4AsH4n', base64Jpeg);
```

### Search

#### searchForItem

Search Spotify for an item.

- **Scopes:** None
- **Returns:** Object keyed by type (`artists`, `tracks`, …), each a Paging object. Since Feb 2026 limit max is 10 (default 5)

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | The search query. |
| `types` | `string[]` | The types of items to search for. |
| `searchOptions` *(optional)* | `{market?:string, limit?:number, offset?:number, include_external?:'audio'}` | Optional parameters (limit max 10 since Feb 2026). |

```js
// Function form
const result = await searchForItem(accessToken, 'Daft Punk', ['artist', 'track'], { limit: 10, market: 'US' });

// Client form
const result2 = await spotify.searchForItem('Daft Punk', ['artist', 'track'], { limit: 10, market: 'US' });
```

### Shows

#### getShow

Get Spotify catalog information for a single show identified by its unique Spotify ID.

- **Scopes:** `user-read-playback-position (optional)`
- **Returns:** Show object (`id`, `name`, `description`, `episodes` page, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `showID` | `string` | The Spotify ID for the show. |

```js
// Function form
const result = await getShow(accessToken, '38bS44xjbVVZ3No3ByF1dJ');

// Client form
const result2 = await spotify.getShow('38bS44xjbVVZ3No3ByF1dJ');
```

#### getSeveralShows

Get Spotify catalog information for several shows based on their Spotify IDs.

- **Scopes:** None
- **Returns:** `{ shows: Show[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfShowID` | `string[]` | The Spotify IDs for the shows. Maximum: 50 IDs. |

```js
// Function form
const result = await getSeveralShows(accessToken, ['38bS44xjbVVZ3No3ByF1dJ']);

// Client form
const result2 = await spotify.getSeveralShows(['38bS44xjbVVZ3No3ByF1dJ']);
```

#### getShowEpisodes

Get Spotify catalog information about an show’s episodes. Optional parameters can be used to limit the number of episodes returned.

- **Scopes:** `user-read-playback-position (optional)`
- **Returns:** Paging object of simplified Episode objects

| Parameter | Type | Description |
| --- | --- | --- |
| `showID` | `string` | The Spotify ID for the show. |

```js
// Function form
const result = await getShowEpisodes(accessToken, '38bS44xjbVVZ3No3ByF1dJ');

// Client form
const result2 = await spotify.getShowEpisodes('38bS44xjbVVZ3No3ByF1dJ');
```

#### getUsersSavedShows

Get the current user's saved shows

- **Scopes:** `user-library-read`
- **Returns:** Paging object of `{ added_at, show }`

```js
// Function form
const result = await getUsersSavedShows(accessToken);

// Client form
const result2 = await spotify.getUsersSavedShows();
```

#### saveShowsForCurrentUser

Save one or more shows to the current user's library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfShowID` | `string[]` | The Spotify IDs for the shows. Maximum: 50 IDs. |

```js
// Function form
const result = await saveShowsForCurrentUser(accessToken, ['38bS44xjbVVZ3No3ByF1dJ']);

// Client form
const result2 = await spotify.saveShowsForCurrentUser(['38bS44xjbVVZ3No3ByF1dJ']);
```

#### removeUsersSavedShows

Remove one or more shows from the current user's library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfShowID` | `string[]` | The Spotify IDs for the shows. Maximum: 50 IDs. |

```js
// Function form
const result = await removeUsersSavedShows(accessToken, ['38bS44xjbVVZ3No3ByF1dJ']);

// Client form
const result2 = await spotify.removeUsersSavedShows(['38bS44xjbVVZ3No3ByF1dJ']);
```

#### checkUsersSavedShows

Check if one or more shows are already saved in the current Spotify user’s library.

- **Scopes:** `user-library-read`
- **Returns:** `boolean[]` in input order

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfShowID` | `string[]` | The Spotify IDs for the shows. Maximum: 50 IDs. |

```js
// Function form
const result = await checkUsersSavedShows(accessToken, ['38bS44xjbVVZ3No3ByF1dJ']);

// Client form
const result2 = await spotify.checkUsersSavedShows(['38bS44xjbVVZ3No3ByF1dJ']);
```

### Tracks

#### getTrack

Get a track from the Spotify API.

- **Scopes:** None
- **Returns:** Track object (`id`, `name`, `artists`, `album`, `duration_ms`, `uri`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `trackID` | `string` | The Spotify ID of the track. |

```js
// Function form
const result = await getTrack(accessToken, '11dFghVXANMlKmJXsNCbNl');

// Client form
const result2 = await spotify.getTrack('11dFghVXANMlKmJXsNCbNl');
```

#### getSeveralTracks

Get a list of tracks from the Spotify API.

- **Scopes:** None
- **Returns:** `{ tracks: Track[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfTrackID` | `string[]` | The list of track IDs to retrieve from the Spotify API. |

```js
// Function form
const result = await getSeveralTracks(accessToken, ['11dFghVXANMlKmJXsNCbNl', '7ouMYWpwJ422jRcDASZB7P']);

// Client form
const result2 = await spotify.getSeveralTracks(['11dFghVXANMlKmJXsNCbNl', '7ouMYWpwJ422jRcDASZB7P']);
```

#### getUsersSavedTracks

Get the current user's saved tracks from the Spotify API.

- **Scopes:** `user-library-read`
- **Returns:** Paging object of `{ added_at, track }`

```js
// Function form
const result = await getUsersSavedTracks(accessToken);

// Client form
const result2 = await spotify.getUsersSavedTracks();
```

#### saveTracksForCurrentUser

Save one or more tracks to the current user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when saved

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfTrackID` | `string[]` | The list of track IDs to save to the user's library. |

```js
// Function form
const result = await saveTracksForCurrentUser(accessToken, ['11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.saveTracksForCurrentUser(['11dFghVXANMlKmJXsNCbNl']);
```

#### removeUsersSavedTracks

Remove one or more tracks from the current user's Spotify library.

- **Scopes:** `user-library-modify`
- **Returns:** `{ status: 200, message }` when removed

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfTrackID` | `string[]` | The list of track IDs to remove from the user's library. |

```js
// Function form
const result = await removeUsersSavedTracks(accessToken, ['11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.removeUsersSavedTracks(['11dFghVXANMlKmJXsNCbNl']);
```

#### checkUsersSavedTracks

Check if one or more tracks is already saved in the current Spotify user's "Your Music" library.

- **Scopes:** `user-library-read`
- **Returns:** `boolean[]` in input order

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfTrackID` | `string[]` | The list of track IDs to check if they are saved in the user's library. |

```js
// Function form
const result = await checkUsersSavedTracks(accessToken, ['11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.checkUsersSavedTracks(['11dFghVXANMlKmJXsNCbNl']);
```

#### getTracksAudioFeatures

Get audio features for multiple tracks based on their Spotify IDs.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ audio_features: AudioFeatures[] }`

| Parameter | Type | Description |
| --- | --- | --- |
| `listOfTrackID` | `string[]` | The list of track IDs to get audio features for. |

```js
// Function form
const result = await getTracksAudioFeatures(accessToken, ['11dFghVXANMlKmJXsNCbNl']);

// Client form
const result2 = await spotify.getTracksAudioFeatures(['11dFghVXANMlKmJXsNCbNl']);
```

#### getTrackAudioFeatures

Get audio features for a singular track based on the Spotify IDs.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** AudioFeatures object (`danceability`, `energy`, `tempo`, …)

| Parameter | Type | Description |
| --- | --- | --- |
| `trackID` | `string` | A track ID to get audio features for. |

```js
// Function form
const result = await getTrackAudioFeatures(accessToken, '11dFghVXANMlKmJXsNCbNl');

// Client form
const result2 = await spotify.getTrackAudioFeatures('11dFghVXANMlKmJXsNCbNl');
```

#### getTrackAudioAnalysis

Get audio analysis for a singular track based on the Spotify IDs.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** Audio analysis (`bars`, `beats`, `sections`, `segments`, `tatums`)

| Parameter | Type | Description |
| --- | --- | --- |
| `trackID` | `string` | A track ID to get audio analysis for. |

```js
// Function form
const result = await getTrackAudioAnalysis(accessToken, '11dFghVXANMlKmJXsNCbNl');

// Client form
const result2 = await spotify.getTrackAudioAnalysis('11dFghVXANMlKmJXsNCbNl');
```

#### getRecommendations

Get recommendations based on seeds (artists, tracks, and genres).

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** `{ seeds, tracks: Track[] }`

| Parameter | Type | Description |
| --- | --- | --- |
| `queryParams` | `object` | The query parameters to be passed in the request. |

```js
// Function form
const result = await getRecommendations(accessToken, { seed_artists: '0TnOYISbd1XYRBk9myaseg', seed_genres: 'classical', limit: 10 });

// Client form
const result2 = await spotify.getRecommendations({ seed_artists: '0TnOYISbd1XYRBk9myaseg', seed_genres: 'classical', limit: 10 });
```

### Users

#### getCurrentUserProfile

Get the current user's profile.

- **Scopes:** `user-read-private (optional)`
- **Returns:** User object (`id`, `display_name`, `images`, `uri`). `email`, `country`, `product`, `followers` were removed Feb 2026

```js
// Function form
const result = await getCurrentUserProfile(accessToken);

// Client form
const result2 = await spotify.getCurrentUserProfile();
```

#### getUsersTopItems

Get the current user's top artists or tracks.

- **Scopes:** `user-top-read`
- **Returns:** Paging object of Artist or Track objects. type is 'artists' or 'tracks'; optional `time_range`, `limit`, `offset`

| Parameter | Type | Description |
| --- | --- | --- |
| `type` | `string` | The type of item to get. Valid values are 'artists' or 'tracks'. |
| `query` *(optional)* | `any` |  |

```js
// Function form
const result = await getUsersTopItems(accessToken, 'tracks', { time_range: 'short_term', limit: 10 });

// Client form
const result2 = await spotify.getUsersTopItems('tracks', { time_range: 'short_term', limit: 10 });
```

#### getUserProfile

Get a user's profile.

> Requires Spotify extended quota mode

- **Scopes:** None
- **Returns:** Public User object

| Parameter | Type | Description |
| --- | --- | --- |
| `userId` | `string` | The user's Spotify user ID. |

```js
// Function form
const result = await getUserProfile(accessToken, 'smedjan');

// Client form
const result2 = await spotify.getUserProfile('smedjan');
```

#### followPlaylist

Let a user follow a playlist.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 200, message }` when followed

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistId` | `string` | The ID of the playlist to follow. |
| `isPublic` *(optional)* | `any` |  |

```js
// Function form
const result = await followPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n', true);

// Client form
const result2 = await spotify.followPlaylist('3cEYpjA9oz9GiPac4AsH4n', true);
```

#### unfollowPlaylist

Let a user unfollow a playlist.

- **Scopes:** `playlist-modify-public / playlist-modify-private`
- **Returns:** `{ status: 200, message }` when unfollowed

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistId` | `string` | The ID of the playlist to unfollow. |

```js
// Function form
const result = await unfollowPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n');

// Client form
const result2 = await spotify.unfollowPlaylist('3cEYpjA9oz9GiPac4AsH4n');
```

#### getFollowedArtists

Get the current user's followed artists.

- **Scopes:** `user-follow-read`
- **Returns:** `{ artists: CursorPaging<Artist> }`

```js
// Function form
const result = await getFollowedArtists(accessToken);

// Client form
const result2 = await spotify.getFollowedArtists();
```

#### followArtistsOrUsers

Follow one or more artists or users.

- **Scopes:** `user-follow-modify`
- **Returns:** `{ status: 204, message }` when followed

| Parameter | Type | Description |
| --- | --- | --- |
| `ids` | `string[]` | The IDs of the artists or users to follow. |

```js
// Function form
const result = await followArtistsOrUsers(accessToken, ['0TnOYISbd1XYRBk9myaseg']);

// Client form
const result2 = await spotify.followArtistsOrUsers(['0TnOYISbd1XYRBk9myaseg']);
```

#### unfollowArtistsOrUsers

Unfollow one or more artists or users.

- **Scopes:** `user-follow-modify`
- **Returns:** `{ status: 204, message }` when unfollowed

| Parameter | Type | Description |
| --- | --- | --- |
| `ids` | `string[]` | The IDs of the artists or users to unfollow. |

```js
// Function form
const result = await unfollowArtistsOrUsers(accessToken, ['0TnOYISbd1XYRBk9myaseg']);

// Client form
const result2 = await spotify.unfollowArtistsOrUsers(['0TnOYISbd1XYRBk9myaseg']);
```

#### checkUserFollowsArtistsOrUsers

Check if one or more artists or users are followed by the current user.

- **Scopes:** `user-follow-read`
- **Returns:** `boolean[]` in input order

| Parameter | Type | Description |
| --- | --- | --- |
| `ids` | `string[]` | The IDs of the artists or users to check. |

```js
// Function form
const result = await checkUserFollowsArtistsOrUsers(accessToken, ['0TnOYISbd1XYRBk9myaseg']);

// Client form
const result2 = await spotify.checkUserFollowsArtistsOrUsers(['0TnOYISbd1XYRBk9myaseg']);
```

#### checkUsersFollowPlaylist

Check if one or more users follow a playlist.

- **Scopes:** `user-follow-read`
- **Returns:** `{ response: boolean[] }`. Spotify can now only check the current user, so other user IDs return `false`

| Parameter | Type | Description |
| --- | --- | --- |
| `playlistId` | `string` | The ID of the playlist to check. |
| `userIds` | `string[]` | The IDs of the users to check. |

```js
// Function form
const result = await checkUsersFollowPlaylist(accessToken, '3cEYpjA9oz9GiPac4AsH4n', ['your-user-id']);

// Client form
const result2 = await spotify.checkUsersFollowPlaylist('3cEYpjA9oz9GiPac4AsH4n', ['your-user-id']);
```

### Endpoints without a replacement

In February 2026 Spotify removed some Web API endpoints for apps in Development Mode. It had already deprecated others for new apps in November 2024. Wherever Spotify offers an equivalent, this library calls it for you without changing the helper's signature or return shape:

- **Per-type save, remove, and check helpers, and the follow and unfollow helpers:** these use `/me/library` with IDs converted to URIs, sent in chunks of 40.
- **`getSeveral*` helpers:** these fetch each item individually, five at a time.
- **`createPlaylist`:** this uses `POST /me/playlists`.

The endpoints below have **no** public replacement. The helpers still work for apps that Spotify has granted extended quota mode, and they return Spotify's error JSON otherwise.

| Helper | Spotify endpoint |
| --- | --- |
| [`getNewReleases`](#getnewreleases) | `GET /browse/new-releases` |
| [`getArtistTopTracks`](#getartisttoptracks) | `GET /artists/{id}/top-tracks` |
| [`getArtistsRelatedArtists`](#getartistsrelatedartists) | `GET /artists/{id}/related-artists` |
| [`getSeveralBrowseCategories`](#getseveralbrowsecategories) | `GET /browse/categories` |
| [`getSingleBrowseCategory`](#getsinglebrowsecategory) | `GET /browse/categories/{id}` |
| [`getAvailableGenreSeeds`](#getavailablegenreseeds) | `GET /recommendations/available-genre-seeds` |
| [`getAvailableMarkets`](#getavailablemarkets) | `GET /markets` |
| [`getUserPlaylists`](#getuserplaylists) | `GET /users/{id}/playlists (for your own playlists use getCurrentUserPlaylists)` |
| [`getFeaturedPlaylists`](#getfeaturedplaylists) | `GET /browse/featured-playlists` |
| [`getCategoryPlaylists`](#getcategoryplaylists) | `GET /browse/categories/{id}/playlists` |
| [`getTracksAudioFeatures`](#gettracksaudiofeatures) | `GET /audio-features` |
| [`getTrackAudioFeatures`](#gettrackaudiofeatures) | `GET /audio-features/{id}` |
| [`getTrackAudioAnalysis`](#gettrackaudioanalysis) | `GET /audio-analysis/{id}` |
| [`getRecommendations`](#getrecommendations) | `GET /recommendations` |
| [`getUserProfile`](#getuserprofile) | `GET /users/{id}` |
