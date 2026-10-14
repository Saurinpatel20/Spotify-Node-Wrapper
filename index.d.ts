export interface SpotifyToken {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  expires_at: number;
  refresh_token?: string;
  scope?: string;
}
export interface TokenManager {
  getAccessToken(): Promise<string>;
  getToken(): Promise<SpotifyToken>;
  invalidate(): void;
}
export interface HttpConfig { maxRetries: number; retryBaseDelayMs: number; maxRetryDelayMs: number; dedupe: boolean; }
export interface RequestOptions { method?: string; query?: Record<string, unknown>; body?: unknown; headers?: Record<string, string>; signal?: AbortSignal; }
export interface PaginateOptions { query?: Record<string, unknown>; maxItems?: number; }
type TokenLike = string | (() => Promise<string>);

export class SpotifyApiError extends Error {
  status?: number; body?: any; headers?: any; url?: string;
}
export const BASE_URI: string;
export function configureHttp(options?: Partial<HttpConfig>): HttpConfig;
export function spotifyFetch(url: string, init?: RequestInit): Promise<Response>;
export function spotifyRequest<T = any>(accessToken: string, path: string, opts?: RequestOptions): Promise<T>;
export function paginate<T = any>(accessToken: TokenLike, start: string | object, opts?: PaginateOptions): AsyncGenerator<T>;
export function getAll<T = any>(accessToken: TokenLike, start: string | object, opts?: PaginateOptions): Promise<T[]>;
export function chunk<T>(arr: T[], size: number): T[][];

export function getSpotifyAccessToken(clientId?: string, clientSecret?: string, redirectUri?: string): Promise<string>;
export function getClientCredentialsToken(clientId?: string, clientSecret?: string): Promise<SpotifyToken>;
export function generatePkcePair(): { codeVerifier: string; codeChallenge: string };
export function getAuthorizationUrl(opts: { clientId?: string; redirectUri?: string; scopes?: string[] | string; state?: string; codeChallenge?: string; showDialog?: boolean }): string;
export function exchangeAuthorizationCode(opts: { code: string; redirectUri?: string; clientId?: string; clientSecret?: string; codeVerifier?: string }): Promise<SpotifyToken>;
export function refreshAccessToken(opts: { refreshToken: string; clientId?: string; clientSecret?: string }): Promise<SpotifyToken>;
export function authorizeWithLocalServer(opts?: { clientId?: string; scopes?: string[] | string; redirectUri?: string; onUrl?: (url: string) => void; timeoutMs?: number }): Promise<SpotifyToken>;
export function createTokenManager(opts?: { clientId?: string; clientSecret?: string; refreshToken?: string; token?: SpotifyToken; refreshMarginMs?: number; onToken?: (t: SpotifyToken) => void }): TokenManager;

export interface SpotifyClientOptions {
  clientId?: string; clientSecret?: string; refreshToken?: string; accessToken?: string;
  token?: SpotifyToken; refreshMarginMs?: number; onToken?: (t: SpotifyToken) => void; http?: Partial<HttpConfig>;
}

// <generated:endpoints> (npm run docs)
/** Functional endpoint helpers: first argument is always the access token. */
/** Get Spotify catalog information for a single album. */
export function getAlbum(accessToken: string, albumID: string): Promise<any>;
/** Get Spotify catalog information for multiple albums identified by their Spotify IDs. */
export function getSeveralAlbums(accessToken: string, listOfAlbumID: string[]): Promise<any>;
/** Get Spotify catalog information about an album’s tracks. */
export function getAlbumTracks(accessToken: string, albumID: string): Promise<any>;
/** Get a list of the albums saved in the current Spotify user’s ‘Your Music’ library. */
export function getUsersSavedAlbums(accessToken: string): Promise<any>;
/** Save one or more albums to the current user’s ‘Your Music’ library. */
export function saveAlbumsForCurrentUser(accessToken: string, listOfAlbumID: string[]): Promise<any>;
/** Remove one or more albums from the current user’s ‘Your Music’ library. */
export function removeUsersSavedAlbums(accessToken: string, listOfAlbumID: string[]): Promise<any>;
/** Check if one or more albums is already saved in the current Spotify user’s ‘Your Music’ library. */
export function checkUsersSavedAlbums(accessToken: string, listOfAlbumID: string[]): Promise<any>;
/** Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab). */
export function getNewReleases(accessToken: string): Promise<any>;
/** Get Spotify catalog information for a single artist identified by their unique Spotify ID. */
export function getArtist(accessToken: string, artistID: string): Promise<any>;
/** Get Spotify catalog information for several artists based on their Spotify IDs. */
export function getSeveralArtists(accessToken: string, listOfArtistID: string[]): Promise<any>;
/** Get Spotify catalog information about an artist’s albums. Optional parameters can be specified in the query string to filter and sort the response. */
export function getArtistsAlbums(accessToken: string, artistID: string, query?: any): Promise<any>;
/** Get Spotify catalog information about an artist’s top tracks by country. */
export function getArtistTopTracks(accessToken: string, artistID: string, countryCode: string): Promise<any>;
/** Get Spotify catalog information about artists similar to a given artist. Similarity is based on analysis of the Spotify community’s listening history. */
export function getArtistsRelatedArtists(accessToken: string, artistID: string): Promise<any>;
/** Get Spotify catalog information for a single audiobook identified by their unique Spotify ID. */
export function getAudiobook(accessToken: string, audiobookID: string): Promise<any>;
/** Get Spotify catalog information for several audiobooks based on their Spotify IDs. */
export function getSeveralAudiobooks(accessToken: string, listOfAudiobookID: string[]): Promise<any>;
/** Get Spotify catalog information about an audiobook’s tracks. */
export function getAudiobookChapters(accessToken: string, audiobookID: string): Promise<any>;
/** Get spotify catalog information about a user's saved audiobooks. */
export function getUsersSavedAudiobooks(accessToken: string): Promise<any>;
/** Save one or more audiobooks to the current user's Spotify library. */
export function saveAudiobooksForCurrentUser(accessToken: string, listOfAudiobookID: string[]): Promise<any>;
/** Remove one or more audiobooks from the current user's Spotify library. */
export function removeUsersSavedAudiobooks(accessToken: string, listOfAudiobookID: string[]): Promise<any>;
/** Check if one or more audiobooks is already saved in the current Spotify user’s ‘Your Music’ library. */
export function checkUsersSavedAudiobooks(accessToken: string, listOfAudiobookID: string[]): Promise<any>;
/** Get a list of categories used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab). */
export function getSeveralBrowseCategories(accessToken: string): Promise<any>;
/** Get a single category used to tag items in Spotify (on, for example, the Spotify player's "Browse" tab). */
export function getSingleBrowseCategory(accessToken: string, categoryID: string): Promise<any>;
/** Get Spotify catalog information for a single chapter identified by their unique Spotify ID. */
export function getSingleChapter(accessToken: string, chapterID: string): Promise<any>;
/** Get Spotify catalog information for several chapters based on their Spotify IDs. */
export function getSeveralChapters(accessToken: string, listOfChapterID: string[]): Promise<any>;
/** Get Spotify catalog information for a single episode identified by their unique Spotify ID. */
export function getEpisode(accessToken: string, episodeID: string): Promise<any>;
/** Get Spotify catalog information for several episodes based on their Spotify IDs. */
export function getSeveralEpisodes(accessToken: string, listOfEpisodeID: string[]): Promise<any>;
/** Get a list of episodes the user has saved in their Spotify library. */
export function getUsersSavedEpisodes(accessToken: string): Promise<any>;
/** Save one or more episodes to the user's Spotify library. */
export function saveEpisodesForCurrentUser(accessToken: string, listOfEpisodeID: string[]): Promise<any>;
/** Remove one or more episodes from the user's Spotify library. */
export function removeUsersSavedEpisodes(accessToken: string, listOfEpisodeID: string[]): Promise<any>;
/** Check if one or more episodes is already saved in the current Spotify user's library. */
export function checkUsersSavedEpisodes(accessToken: string, listOfEpisodeID: string[]): Promise<any>;
/** Get a list of available genre seeds for recommendations. */
export function getAvailableGenreSeeds(accessToken: string): Promise<any>;
/** Save items (tracks, albums, episodes, shows, audiobooks) or follow users/playlists, by Spotify URI. Uses `PUT /me/library` (added February 2026; replaces the per-type save/follow endpoints). */
export function saveToLibrary(accessToken: string, uris: string[]): Promise<any>;
/** Remove items from the library or unfollow users/playlists, by Spotify URI (`DELETE /me/library`). */
export function removeFromLibrary(accessToken: string, uris: string[]): Promise<any>;
/** Check whether items are saved/followed in the current user's library (`GET /me/library/contains`). */
export function checkLibraryContains(accessToken: string, uris: string[]): Promise<any>;
/** Get a list of available markets for tracks. */
export function getAvailableMarkets(accessToken: string): Promise<any>;
/** Get the next item from the Spotify API using the next URL parameter */
export function getNext(accessToken: string, nextURL: string): Promise<any>;
/** Get information about the user's current playback state, including track, track progress, and active device. */
export function getPlaybackState(accessToken: string): Promise<any>;
/** Transfer the user's playback to a new device. */
export function transferPlayback(accessToken: string, deviceID?: string): Promise<any>;
/** Get information about the user's currently available devices. */
export function getAvailableDevices(accessToken: string): Promise<any>;
/** Get the user's current playback, including track, track progress, and active device. */
export function getCurrentlyPlayingTrack(accessToken: string): Promise<any>;
/** Starts the playback on the specified device. */
export function startPlayback(accessToken: string, deviceID?: string, playOptions?: {contextUri?:string, uris?:string[], offset?:number|{position?:number,uri?:string}, positionMs?:number}): Promise<any>;
/** Pauses the playback on the specified device. */
export function pausePlayback(accessToken: string, deviceID?: string): Promise<any>;
/** Skips to the next track in the queue for the specified device. */
export function skipToNextTrack(accessToken: string, deviceID?: string): Promise<any>;
/** Skips to the previous track in the queue for the specified device. */
export function skipToPreviousTrack(accessToken: string, deviceID?: string): Promise<any>;
/** Seeks to the specified position in the currently playing track for the specified device. */
export function seekToPosition(accessToken: string, deviceID: string | undefined, positionMs: number): Promise<any>;
/** Sets the repeat mode for the specified device. */
export function setRepeatMode(accessToken: string, state: string, deviceID?: string): Promise<any>;
/** Sets the volume for the specified device. */
export function setPlaybackVolume(accessToken: string, volumePercent: number, deviceID?: string): Promise<any>;
/** Toggles shuffle mode for the specified device. */
export function togglePlaybackShuffle(accessToken: string, state: boolean, deviceID?: string): Promise<any>;
/** Get the recently played tracks from the playback queue. */
export function getRecentlyPlayedTracks(accessToken: string, limit?: number, before?: number, after?: number): Promise<any>;
/** Get the user's playback queue. */
export function getUserQueue(accessToken: string): Promise<any>;
/** Adds an item to the user's playback queue. */
export function addItemToPlaybackQueue(accessToken: string, uri: string, deviceID?: string): Promise<any>;
/** Get the playlist with the specified playlist ID */
export function getPlaylist(accessToken: string, playlistID: string): Promise<any>;
/** Change the details of a playlist to the specified information. */
export function changePlaylistDetails(accessToken: string, playlistID: string, name?: string, isPublic?: boolean, isCollaborative?: boolean, description?: string): Promise<any>;
/** Get the items in the playlist with the specified playlist ID. */
export function getPlaylistItems(accessToken: string, playlistID: string, query?: {market?:string, fields?:string, limit?:number, offset?:number, additional_types?:string}): Promise<any>;
/** Update the items in the playlist with the specified playlist ID. */
export function updatePlaylistItems(accessToken: string, playlistID: string, uris?: string[], rangeStart?: number, insertBefore?: number, rangeLength?: number, snapshotID?: string): Promise<any>;
/** Add items to the playlist with the specified playlist ID. */
export function addItemsToPlaylist(accessToken: string, playlistID: string, uris: string[], position?: number): Promise<any>;
/** Remove items from the playlist with the specified playlist ID. */
export function removePlaylistItems(accessToken: string, playlistID: string, uris: string[], snapshotID?: string): Promise<any>;
/** Get a list of the current user's playlists. */
export function getCurrentUserPlaylists(accessToken: string): Promise<any>;
/** Get a list of the current user's playlists. */
export function getUserPlaylists(accessToken: string, userID: string): Promise<any>;
/** Create a new playlist for the current user. */
export function createPlaylist(accessToken: string, userID: string, name: string, isPublic?: boolean, isCollaborative?: boolean, description?: string): Promise<any>;
/** Create a playlist for the current user (`POST /me/playlists`). Replaces `createPlaylist`, which used the removed `/users/{id}/playlists` endpoint. */
export function createPlaylistForCurrentUser(accessToken: string, name: string, details?: {public?:boolean, collaborative?:boolean, description?:string}): Promise<any>;
/** Get an object consisting of Spotify featured playlists. */
export function getFeaturedPlaylists(accessToken: string): Promise<any>;
/** Get a list of Spotify category playlists. */
export function getCategoryPlaylists(accessToken: string, categoryID: string): Promise<any>;
/** Get the playlist cover image given the ID. */
export function getPlaylistCoverImage(accessToken: string, playlistID: string): Promise<any>;
/** Add a custom cover image to a playlist. */
export function addCustomPlaylistCoverImage(accessToken: string, playlistID: string, image: string): Promise<any>;
/** Search Spotify for an item. */
export function searchForItem(accessToken: string, query: string, types: string[], searchOptions?: {market?:string, limit?:number, offset?:number, include_external?:'audio'}): Promise<any>;
/** Get Spotify catalog information for a single show identified by its unique Spotify ID. */
export function getShow(accessToken: string, showID: string): Promise<any>;
/** Get Spotify catalog information for several shows based on their Spotify IDs. */
export function getSeveralShows(accessToken: string, listOfShowID: string[]): Promise<any>;
/** Get Spotify catalog information about an show’s episodes. Optional parameters can be used to limit the number of episodes returned. */
export function getShowEpisodes(accessToken: string, showID: string): Promise<any>;
/** Get the current user's saved shows */
export function getUsersSavedShows(accessToken: string): Promise<any>;
/** Save one or more shows to the current user's library. */
export function saveShowsForCurrentUser(accessToken: string, listOfShowID: string[]): Promise<any>;
/** Remove one or more shows from the current user's library. */
export function removeUsersSavedShows(accessToken: string, listOfShowID: string[]): Promise<any>;
/** Check if one or more shows are already saved in the current Spotify user’s library. */
export function checkUsersSavedShows(accessToken: string, listOfShowID: string[]): Promise<any>;
/** Get a track from the Spotify API. */
export function getTrack(accessToken: string, trackID: string): Promise<any>;
/** Get a list of tracks from the Spotify API. */
export function getSeveralTracks(accessToken: string, listOfTrackID: string[]): Promise<any>;
/** Get the current user's saved tracks from the Spotify API. */
export function getUsersSavedTracks(accessToken: string): Promise<any>;
/** Save one or more tracks to the current user's Spotify library. */
export function saveTracksForCurrentUser(accessToken: string, listOfTrackID: string[]): Promise<any>;
/** Remove one or more tracks from the current user's Spotify library. */
export function removeUsersSavedTracks(accessToken: string, listOfTrackID: string[]): Promise<any>;
/** Check if one or more tracks is already saved in the current Spotify user's "Your Music" library. */
export function checkUsersSavedTracks(accessToken: string, listOfTrackID: string[]): Promise<any>;
/** Get audio features for multiple tracks based on their Spotify IDs. */
export function getTracksAudioFeatures(accessToken: string, listOfTrackID: string[]): Promise<any>;
/** Get audio features for a singular track based on the Spotify IDs. */
export function getTrackAudioFeatures(accessToken: string, trackID: string): Promise<any>;
/** Get audio analysis for a singular track based on the Spotify IDs. */
export function getTrackAudioAnalysis(accessToken: string, trackID: string): Promise<any>;
/** Get recommendations based on seeds (artists, tracks, and genres). */
export function getRecommendations(accessToken: string, queryParams: Record<string, any>): Promise<any>;
/** Get the current user's profile. */
export function getCurrentUserProfile(accessToken: string): Promise<any>;
/** Get the current user's top artists or tracks. */
export function getUsersTopItems(accessToken: string, type: string, query?: any): Promise<any>;
/** Get a user's profile. */
export function getUserProfile(accessToken: string, userId: string): Promise<any>;
/** Let a user follow a playlist. */
export function followPlaylist(accessToken: string, playlistId: string, isPublic?: any): Promise<any>;
/** Let a user unfollow a playlist. */
export function unfollowPlaylist(accessToken: string, playlistId: string): Promise<any>;
/** Get the current user's followed artists. */
export function getFollowedArtists(accessToken: string): Promise<any>;
/** Follow one or more artists or users. */
export function followArtistsOrUsers(accessToken: string, ids: string[]): Promise<any>;
/** Unfollow one or more artists or users. */
export function unfollowArtistsOrUsers(accessToken: string, ids: string[]): Promise<any>;
/** Check if one or more artists or users are followed by the current user. */
export function checkUserFollowsArtistsOrUsers(accessToken: string, ids: string[]): Promise<any>;
/** Check if one or more users follow a playlist. */
export function checkUsersFollowPlaylist(accessToken: string, playlistId: string, userIds: string[]): Promise<any>;

export class SpotifyClient {
  constructor(opts?: SpotifyClientOptions);
  getAccessToken(): Promise<string>;
  request<T = any>(path: string, opts?: RequestOptions): Promise<T>;
  paginate<T = any>(start: string | object, opts?: PaginateOptions): AsyncGenerator<T>;
  getAll<T = any>(start: string | object, opts?: PaginateOptions): Promise<T[]>;
  getAlbum(albumID: string): Promise<any>;
  getSeveralAlbums(listOfAlbumID: string[]): Promise<any>;
  getAlbumTracks(albumID: string): Promise<any>;
  getUsersSavedAlbums(): Promise<any>;
  saveAlbumsForCurrentUser(listOfAlbumID: string[]): Promise<any>;
  removeUsersSavedAlbums(listOfAlbumID: string[]): Promise<any>;
  checkUsersSavedAlbums(listOfAlbumID: string[]): Promise<any>;
  getNewReleases(): Promise<any>;
  getArtist(artistID: string): Promise<any>;
  getSeveralArtists(listOfArtistID: string[]): Promise<any>;
  getArtistsAlbums(artistID: string, query?: any): Promise<any>;
  getArtistTopTracks(artistID: string, countryCode: string): Promise<any>;
  getArtistsRelatedArtists(artistID: string): Promise<any>;
  getAudiobook(audiobookID: string): Promise<any>;
  getSeveralAudiobooks(listOfAudiobookID: string[]): Promise<any>;
  getAudiobookChapters(audiobookID: string): Promise<any>;
  getUsersSavedAudiobooks(): Promise<any>;
  saveAudiobooksForCurrentUser(listOfAudiobookID: string[]): Promise<any>;
  removeUsersSavedAudiobooks(listOfAudiobookID: string[]): Promise<any>;
  checkUsersSavedAudiobooks(listOfAudiobookID: string[]): Promise<any>;
  getSeveralBrowseCategories(): Promise<any>;
  getSingleBrowseCategory(categoryID: string): Promise<any>;
  getSingleChapter(chapterID: string): Promise<any>;
  getSeveralChapters(listOfChapterID: string[]): Promise<any>;
  getEpisode(episodeID: string): Promise<any>;
  getSeveralEpisodes(listOfEpisodeID: string[]): Promise<any>;
  getUsersSavedEpisodes(): Promise<any>;
  saveEpisodesForCurrentUser(listOfEpisodeID: string[]): Promise<any>;
  removeUsersSavedEpisodes(listOfEpisodeID: string[]): Promise<any>;
  checkUsersSavedEpisodes(listOfEpisodeID: string[]): Promise<any>;
  getAvailableGenreSeeds(): Promise<any>;
  saveToLibrary(uris: string[]): Promise<any>;
  removeFromLibrary(uris: string[]): Promise<any>;
  checkLibraryContains(uris: string[]): Promise<any>;
  getAvailableMarkets(): Promise<any>;
  getNext(nextURL: string): Promise<any>;
  getPlaybackState(): Promise<any>;
  transferPlayback(deviceID?: string): Promise<any>;
  getAvailableDevices(): Promise<any>;
  getCurrentlyPlayingTrack(): Promise<any>;
  startPlayback(deviceID?: string, playOptions?: {contextUri?:string, uris?:string[], offset?:number|{position?:number,uri?:string}, positionMs?:number}): Promise<any>;
  pausePlayback(deviceID?: string): Promise<any>;
  skipToNextTrack(deviceID?: string): Promise<any>;
  skipToPreviousTrack(deviceID?: string): Promise<any>;
  seekToPosition(deviceID: string | undefined, positionMs: number): Promise<any>;
  setRepeatMode(state: string, deviceID?: string): Promise<any>;
  setPlaybackVolume(volumePercent: number, deviceID?: string): Promise<any>;
  togglePlaybackShuffle(state: boolean, deviceID?: string): Promise<any>;
  getRecentlyPlayedTracks(limit?: number, before?: number, after?: number): Promise<any>;
  getUserQueue(): Promise<any>;
  addItemToPlaybackQueue(uri: string, deviceID?: string): Promise<any>;
  getPlaylist(playlistID: string): Promise<any>;
  changePlaylistDetails(playlistID: string, name?: string, isPublic?: boolean, isCollaborative?: boolean, description?: string): Promise<any>;
  getPlaylistItems(playlistID: string, query?: {market?:string, fields?:string, limit?:number, offset?:number, additional_types?:string}): Promise<any>;
  updatePlaylistItems(playlistID: string, uris?: string[], rangeStart?: number, insertBefore?: number, rangeLength?: number, snapshotID?: string): Promise<any>;
  addItemsToPlaylist(playlistID: string, uris: string[], position?: number): Promise<any>;
  removePlaylistItems(playlistID: string, uris: string[], snapshotID?: string): Promise<any>;
  getCurrentUserPlaylists(): Promise<any>;
  getUserPlaylists(userID: string): Promise<any>;
  createPlaylist(userID: string, name: string, isPublic?: boolean, isCollaborative?: boolean, description?: string): Promise<any>;
  createPlaylistForCurrentUser(name: string, details?: {public?:boolean, collaborative?:boolean, description?:string}): Promise<any>;
  getFeaturedPlaylists(): Promise<any>;
  getCategoryPlaylists(categoryID: string): Promise<any>;
  getPlaylistCoverImage(playlistID: string): Promise<any>;
  addCustomPlaylistCoverImage(playlistID: string, image: string): Promise<any>;
  searchForItem(query: string, types: string[], searchOptions?: {market?:string, limit?:number, offset?:number, include_external?:'audio'}): Promise<any>;
  getShow(showID: string): Promise<any>;
  getSeveralShows(listOfShowID: string[]): Promise<any>;
  getShowEpisodes(showID: string): Promise<any>;
  getUsersSavedShows(): Promise<any>;
  saveShowsForCurrentUser(listOfShowID: string[]): Promise<any>;
  removeUsersSavedShows(listOfShowID: string[]): Promise<any>;
  checkUsersSavedShows(listOfShowID: string[]): Promise<any>;
  getTrack(trackID: string): Promise<any>;
  getSeveralTracks(listOfTrackID: string[]): Promise<any>;
  getUsersSavedTracks(): Promise<any>;
  saveTracksForCurrentUser(listOfTrackID: string[]): Promise<any>;
  removeUsersSavedTracks(listOfTrackID: string[]): Promise<any>;
  checkUsersSavedTracks(listOfTrackID: string[]): Promise<any>;
  getTracksAudioFeatures(listOfTrackID: string[]): Promise<any>;
  getTrackAudioFeatures(trackID: string): Promise<any>;
  getTrackAudioAnalysis(trackID: string): Promise<any>;
  getRecommendations(queryParams: Record<string, any>): Promise<any>;
  getCurrentUserProfile(): Promise<any>;
  getUsersTopItems(type: string, query?: any): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
  followPlaylist(playlistId: string, isPublic?: any): Promise<any>;
  unfollowPlaylist(playlistId: string): Promise<any>;
  getFollowedArtists(): Promise<any>;
  followArtistsOrUsers(ids: string[]): Promise<any>;
  unfollowArtistsOrUsers(ids: string[]): Promise<any>;
  checkUserFollowsArtistsOrUsers(ids: string[]): Promise<any>;
  checkUsersFollowPlaylist(playlistId: string, userIds: string[]): Promise<any>;
}
// </generated:endpoints>
