# Changelog

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
