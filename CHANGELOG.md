# Changelog

## 3.2.0 - 2026-10-14

### Changed
- 29 legacy helpers whose Spotify endpoints were removed in February 2026 now call the replacement endpoints. Their signatures and return shapes are unchanged:
  - Per-type save, remove, and check helpers for albums, audiobooks, episodes, shows, and tracks (15 helpers) use `PUT`/`DELETE /me/library` and `GET /me/library/contains`. IDs are converted to URIs and sent in chunks of 40. `check*` helpers still resolve to `boolean[]` in input order.
  - `followPlaylist`, `unfollowPlaylist`, `followArtistsOrUsers`, `unfollowArtistsOrUsers`, and `checkUserFollowsArtistsOrUsers` use `/me/library`. A 22-character base62 ID is treated as an artist, and any other ID as a user. Pass `spotify:user:` or `spotify:artist:` URIs to be explicit.
  - `checkUsersFollowPlaylist` uses `/me/library/contains` for the current user and still returns `{ response: boolean[] }`. IDs other than the current user's resolve to `false`, because Spotify can no longer check other users.
  - `getSeveralAlbums`, `getSeveralArtists`, `getSeveralAudiobooks`, `getSeveralChapters`, `getSeveralEpisodes`, `getSeveralShows`, and `getSeveralTracks` fetch each item individually, five at a time, and keep the `{ albums: [...] }`-style shape. Unknown IDs become `null`, as in the batch endpoints. The old 20/50-ID caps are lifted.
  - `createPlaylist` uses `POST /me/playlists` and still returns `{ status: 201, message }`. `userID` is ignored, since playlists can only be created for the authenticated user.
- Docs: removed the "Restricted" warnings. The 15 helpers with no public replacement now carry a short neutral note ("Requires Spotify extended quota mode"), and the README gains an "Endpoints without a replacement" section that lists them and explains why.

### Added
- Tests for every rerouted helper, covering new paths, URI conversion, chunking, error passthrough, order preservation, and return shapes (128 tests total).

## 3.1.0 - 2026-10-14

### Added
- Generic library endpoints from Spotify's February 2026 API: `saveToLibrary`, `removeFromLibrary`, and `checkLibraryContains` (`PUT`/`DELETE /me/library` and `GET /me/library/contains`, up to 40 URIs). They replace the per-type save, remove, follow, and contains endpoints.
- `createPlaylistForCurrentUser` (`POST /me/playlists`), which replaces `createPlaylist` (`POST /users/{id}/playlists` was removed).
- Optional arguments: `startPlayback(token, deviceID?, { contextUri, uris, offset, positionMs })`, `searchForItem(..., { limit, market, offset })`, `getUsersTopItems(..., { time_range, limit, offset })`, `getArtistsAlbums(..., { include_groups, ... })`, and `getPlaylistItems(..., { fields, limit, offset, market })`.
- A complete generated API reference for all 93 endpoints. Each entry has a description, parameter table, required scopes, return shape, function-form and `SpotifyClient` examples, and Premium or restricted flags. All placeholder text is gone.
- `npm run docs` generates the reference and the `index.d.ts` endpoint signatures, which are now typed per parameter. `npm run lint` fails if the docs are stale, an endpoint is undocumented, a README example doesn't parse, or placeholder text appears.
- A test suite that runs every documented example against a mocked API (118 tests).

### Changed
- Playlist item endpoints now use `/playlists/{id}/items` instead of the removed `/tracks` path. `removePlaylistItems` sends the new `{ items: [{ uri }] }` body.

### Fixed
- `getCurrentUserProfile` sent a malformed `Authorization` header (a stray quote).
- `saveEpisodesForCurrentUser` and `removeUsersSavedEpisodes` sent an invalid body and crashed parsing the empty success response.
- JSDoc types for track helpers (`array` became `string[]` or `string`).

## 3.0.0 - 2026-10-14

### Added
- `SpotifyClient` class: mints, caches, and auto-refreshes tokens, and exposes every endpoint as a method with no `accessToken` argument. Retries once on `401`.
- Token helpers: `getClientCredentialsToken`, `createTokenManager` (caching, early refresh, shared in-flight refresh, `onToken` hook), `generatePkcePair`, `getAuthorizationUrl`, `exchangeAuthorizationCode`, `refreshAccessToken`, and `authorizeWithLocalServer` (one-call PKCE login through a local callback server).
- Environment variable defaults: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, `SPOTIFY_REFRESH_TOKEN` (the legacy `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` still work).
- `spotifyRequest` / `client.request` for any endpoint, with typed `SpotifyApiError`.
- Pagination helpers `paginate` (async iterator) and `getAll`, plus `chunk` for bulk-ID endpoints.
- `configureHttp` for retry and dedupe settings.
- TypeScript declarations (`index.d.ts`), an offline mocked test suite, and a dependency-free `npm run lint`.
- Full README covering auth flows, configuration, pagination, and error handling.

### Changed
- **Breaking:** requires Node.js 18 or later. Removed the `node-fetch` dependency in favor of the built-in `fetch`, which keeps connections alive.
- All requests now retry `429` responses after the `Retry-After` delay, retry transient 5xx and network errors with backoff, and share identical concurrent GET requests.
- `getSpotifyAccessToken` now throws a descriptive error on failure instead of resolving `undefined`. Its `redirectUri` argument is now optional.
- Package is now publish-ready: added `exports`, `files`, `engines`, and `types`, and committed `node_modules` was removed from the repo.

### Fixed
- `getAudiobook` called the `artists/` endpoint. It now calls `audiobooks/{id}`.
- `getAudiobookChapters` called `audiobook/` (singular). It now calls `audiobooks/{id}/chapters`.
- Player endpoints no longer send `device_id=undefined` when no device is given.
