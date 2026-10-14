# Spotify Node Wrapper

A small, dependency-free Node.js wrapper for the [Spotify Web API](https://developer.spotify.com/documentation/web-api).
Every endpoint is a plain async function, and a `SpotifyClient` class handles tokens for you: it mints them, caches them, and refreshes them.

- **Zero runtime dependencies.** Uses Node's built-in `fetch` (undici), which keeps connections alive.
- **Easy token minting.** Get a client-credentials token in one call, log in with Authorization Code + PKCE through a local callback server, or refresh tokens automatically.
- **Resilient.** Retries `429 Too Many Requests` after the `Retry-After` delay, and retries transient 5xx and network errors with exponential backoff.
- **Fast.** Identical GET requests that are in flight at the same time share one network call, and pagination helpers stream every page for you.
- **Typed.** Ships with TypeScript declarations (`index.d.ts`).

Requires **Node.js 18+**. ESM only.

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

*Documentation in progress. Refer to the provided code examples for guidance until full documentation is available.*

### getSpotifyAccessToken
Obtain a Spotify access token using the client ID, client secret, and redirect URI.
```javascript
// Example usage
getSpotifyAccessToken('your_client_id', 'your_client_secret', 'your_redirect_uri')
  .then(token => console.log('Access Token:', token));
```

### getAlbum
Fetch detailed information about a specific album on Spotify.
```javascript
// Example usage
getAlbum('your_access_token', 'album_id')
  .then(album => console.log(album));
```

### getSeveralAlbums
Retrieve details for multiple albums in a single request.
```javascript
// Example usage
getSeveralAlbums('your_access_token', ['album_id1', 'album_id2'])
  .then(albums => console.log(albums));
```

### getAlbumTracks
Get the tracks from a specific album.
```javascript
// Example usage
getAlbumTracks('your_access_token', 'album_id')
  .then(tracks => console.log(tracks));
```

### getUsersSavedAlbums
List albums saved in the user's Spotify library.
```javascript
// Yet to provide example usage
```

### saveAlbumsForCurrentUser
Save one or more albums to the user's Spotify library.
```javascript
// Yet to provide example usage
```

### removeUsersSavedAlbums
Remove one or more albums from the user's Spotify library.
```javascript
// Yet to provide example usage
```

### checkUsersSavedAlbums
Check if specific albums are in the user's Spotify library.
```javascript
// Yet to provide example usage
```

### getNewReleases
Retrieve a list of newly released albums on Spotify.
```javascript
// Yet to provide example usage
```

### getArtist
Fetch detailed information about a specific artist.
```javascript
// Yet to provide example usage
```

### getSeveralArtists
Get details for multiple artists in a single request.
```javascript
// Yet to provide example usage
```

### getArtistsAlbums
List the albums of a specific artist.
```javascript
// Yet to provide example usage
```

### getArtistTopTracks
Retrieve the top tracks of a specific artist.
```javascript
// Yet to provide example usage
```

### getArtistsRelatedArtists
Get a list of artists related to a specific artist.
```javascript
// Yet to provide example usage
```

### getAudiobook
Get detailed information about a specific audiobook.
```javascript
// Yet to provide example usage
```

### getSeveralAudiobooks
Retrieve details for multiple audiobooks in a single request.
```javascript
// Yet to provide example usage
```

### getAudiobookChapters
Fetch the chapters of a specific audiobook.
```javascript
// Yet to provide example usage
```

### getUsersSavedAudiobooks
Retrieves a list of audiobooks saved in the user's library.
```javascript
// Yet to provide example usage
```

### saveAudiobooksForCurrentUser
Saves one or more audiobooks to the user's library.
```javascript
// Yet to provide example usage
```

### removeUsersSavedAudiobooks
Removes one or more audiobooks from the user's library.
```javascript
// Yet to provide example usage
```

### checkUsersSavedAudiobooks
Checks if one or more audiobooks are saved in the user's library.
```javascript
// Yet to provide example usage
```

### getSeveralBrowseCategories
Retrieves detailed information about multiple browse categories in a single request.
```javascript
// Yet to provide example usage
```

### getSingleBrowseCategory
Retrieves detailed information about a specific browse category.
```javascript
// Yet to provide example usage
```

### getSingleChapter
Retrieves detailed information about a specific chapter of an audiobook.
```javascript
// Yet to provide example usage
```

### getSeveralChapters
Retrieves detailed information about multiple chapters of an audiobook in a single request.
```javascript
// Yet to provide example usage
```

### getEpisode
Retrieves detailed information about a specific episode of a show or podcast.
```javascript
// Yet to provide example usage
```

### getSeveralEpisodes
Retrieves detailed information about multiple episodes of shows or podcasts in a single request.
```javascript
// Yet to provide example usage
```

### getUsersSavedEpisodes
Retrieves a list of episodes saved in the user's library.
```javascript
// Yet to provide example usage
```

### saveEpisodesForCurrentUser
Saves one or more episodes to the user's library.
```javascript
// Yet to provide example usage
```

### removeUsersSavedEpisodes
Removes one or more episodes from the user's library.
```javascript
// Yet to provide example usage
```

### checkUsersSavedEpisodes
Checks if one or more episodes are saved in the user's library.
```javascript
// Yet to provide example usage
```

### getAvailableGenreSeeds
Retrieves a list of available genre seeds for recommendations.
```javascript
// Yet to provide example usage
```

### getNext
Retrieves the next set of items from a previously fetched paginated endpoint.
```javascript
// Yet to provide example usage
```

### getAvailableMarkets
Retrieves a list of available markets for playback.
```javascript
// Yet to provide example usage
```

### getPlaybackState
Retrieves the playback state, including the currently playing track, from the user's active device.
```javascript
// Yet to provide example usage
```

### transferPlayback
Transfers playback to a different device.
```javascript
// Yet to provide example usage
```

### getAvailableDevices
Retrieves a list of available devices for playback.
```javascript
// Yet to provide example usage
```

### getCurrentlyPlayingTrack
Retrieves the currently playing track from the user's active device.
```javascript
// Yet to provide example usage
```

### startPlayback
Starts or resumes playback on the user's active device.
```javascript
// Yet to provide example usage
```

### pausePlayback
Pauses playback on the user's active device.
```javascript
// Yet to provide example usage
```

### skipToNextTrack
Skips to the next track in the user's playback queue.
```javascript
// Yet to provide example usage
```

### skipToPreviousTrack
Skips to the previous track in the user's playback queue.
```javascript
// Yet to provide example usage
```

### seekToPosition
Seeks to a specified position in the currently playing track.
```javascript
// Yet to provide example usage
```

### setRepeatMode
Sets the repeat mode for the user's playback.
```javascript
// Yet to provide example usage
```

### setPlaybackVolume
Sets the volume for the user's active device.
```javascript
// Yet to provide example usage
```

### togglePlaybackShuffle
Toggles the shuffle mode for the user's playback.
```javascript
// Yet to provide example usage
```

### getRecentlyPlayedTracks
Retrieves a list of the user's recently played tracks.
```javascript
// Yet to provide example usage
```

### getUserQueue
Retrieves the user's playback queue.
```javascript
// Yet to provide example usage
```

### addItemToPlaybackQueue
Adds an item to the user's playback queue.
```javascript
// Yet to provide example usage
```

### getPlaylist
Retrieves detailed information about a specific playlist.
```javascript
// Yet to provide example usage
```

### changePlaylistDetails
Changes the details of a specific playlist.
```javascript
// Yet to provide example usage
```

### getPlaylistItems
Retrieves the items (tracks or episodes) of a specific playlist.
```javascript
// Yet to provide example usage
```

### updatePlaylistItems
Updates the items (tracks or episodes) of a specific playlist.
```javascript
// Yet to provide example usage
```

### addItemsToPlaylist
Adds items (tracks or episodes) to a specific playlist.
```javascript
// Yet to provide example usage
```

### removePlaylistItems
Removes items (tracks or episodes) from a specific playlist.
```javascript
// Yet to provide example usage
```

### getCurrentUserPlaylists
Retrieves a list of playlists owned or followed by the current user.
```javascript
// Yet to provide example usage
```

### getUserPlaylists
Retrieves a list of playlists owned or followed by a specific user.
```javascript
// Yet to provide example usage
```

### createPlaylist
Creates a new playlist for the current user.
```javascript
// Yet to provide example usage
```

### getFeaturedPlaylists
Retrieves a list of featured playlists.
```javascript
// Yet to provide example usage
```

### getCategoryPlaylists
Retrieves a list of playlists within a specific category.
```javascript
// Yet to provide example usage
```

### getPlaylistCoverImage
Retrieves the cover image of a specific playlist.
```javascript
// Yet to provide example usage
```

### addCustomPlaylistCoverImage
Adds a custom cover image to a specific playlist.
```javascript
// Yet to provide example usage
```

### searchForItem
Searches for items (tracks, albums, artists, playlists, etc.) based on a query.
```javascript
// Yet to provide example usage
```

### getShow
Retrieves detailed information about a specific show or podcast.
```javascript
// Yet to provide example usage
```

### getSeveralShows
Retrieves detailed information about multiple shows or podcasts in a single request.
```javascript
// Yet to provide example usage
```

### getShowEpisodes
Retrieves the episodes of a specific show or podcast.
```javascript
// Yet to provide example usage
```

### getUsersSavedShows
Retrieves a list of shows or podcasts saved in the user's library.
```javascript
// Yet to provide example usage
```

### saveShowsForCurrentUser
Saves one or more shows or podcasts to the user's library.
```javascript
// Yet to provide example usage
```

### removeUsersSavedShows
Removes one or more shows or podcasts from the user's library.
```javascript
// Yet to provide example usage
```

### checkUsersSavedShows
Checks if one or more shows or podcasts are saved in the user's library.
```javascript
// Yet to provide example usage
```

### getTrack
Retrieves detailed information about a specific track.
```javascript
// Yet to provide example usage
```

### getSeveralTracks
Retrieves detailed information about multiple tracks in a single request.
```javascript
// Yet to provide example usage
```

### getUsersSavedTracks
Retrieves a list of tracks saved in the user's library.
```javascript
// Yet to provide example usage
```

### saveTracksForCurrentUser
Saves one or more tracks to the user's library.
```javascript
// Yet to provide example usage
```

### removeUsersSavedTracks
Removes one or more tracks from the user's library.
```javascript
// Yet to provide example usage
```

### checkUsersSavedTracks
Checks if one or more tracks are saved in the user's library.
```javascript
// Yet to provide example usage
```

### getTracksAudioFeatures
Retrieves audio features (such as danceability, tempo, etc.) for multiple tracks in a single request.
```javascript
// Yet to provide example usage
```

### getTrackAudioFeatures
Retrieves audio features (such as danceability, tempo, etc.) for a specific track.
```javascript
// Yet to provide example usage
```

### getTrackAudioAnalysis
Retrieves a detailed audio analysis of a specific track.
```javascript
// Yet to provide example usage
```

### getRecommendations
Generates a list of recommended tracks based on a variety of seeds (such as artists, genres, etc.).
```javascript
// Yet to provide example usage
```

### getCurrentUserProfile
Retrieves the current user's profile information.
```javascript
// Yet to provide example usage
```

### getUsersTopItems
Retrieves a list of the user's top tracks or artists.
```javascript
// Yet to provide example usage
```

### getUserProfile
Retrieves the profile information of a specific user.
```javascript
// Yet to provide example usage
```

### followPlaylist
Follows a specific playlist.
```javascript
// Yet to provide example usage
```

### unfollowPlaylist
Unfollows a specific playlist.
```javascript
// Yet to provide example usage
```

### getFollowedArtists
Retrieves a list of artists followed by the user.
```javascript
// Yet to provide example usage
```

### followArtistsOrUsers
Follows one or more artists or users.
```javascript
// Yet to provide example usage
```

### unfollowArtistsOrUsers
Unfollows one or more artists or users.
```javascript
// Yet to provide example usage
```

### checkUserFollowsArtistsOrUsers
Checks if the user follows one or more artists or users.
```javascript
// Yet to provide example usage
```

### checkUsersFollowPlaylist
Checks if one or more users follow a specific playlist.
```javascript
// Yet to provide example usage
```

## Official API documentation
Please refer to the [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference/) for detailed information about the available endpoints and their parameters.

## Contributing

Contributions to the Spotify Node Wrapper are welcome! If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/Saurinpatel20/spotify-node-wrapper). You can also submit pull requests with proposed changes.

When contributing code, please ensure that your changes follow appropriate coding style and include tests if possible. Additionally, provide a thorough description of the changes in your pull request.

## Acknowledgements

The Spotify Node Wrapper was developed by [Saurin Patel](https://github.com/Saurinpatel20) and is inspired by the [Spotify Web API](https://developer.spotify.com/documentation/web-api/).

## Disclaimer

This package is not officially associated with Spotify. It is an independent project created by developers for developers to simplify working with the Spotify Web API.