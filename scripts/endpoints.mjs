// Documentation metadata for every endpoint helper. Used by scripts/gen-docs.mjs to build
// the README API reference and the endpoint declarations in index.d.ts.
// args: example arguments (JS source, excluding accessToken). scopes: OAuth scopes ('' = none, any token).
// returns: response shape. restricted: Spotify removed it for Development Mode apps in February 2026.
const ALB = "'4aawyAB9vmqN3uQ7FjRGTy'", ART = "'0TnOYISbd1XYRBk9myaseg'", TRK = "'11dFghVXANMlKmJXsNCbNl'";
const SHOW = "'38bS44xjbVVZ3No3ByF1dJ'", EP = "'512ojhOuo1ktJprKbVcKyQ'", BOOK = "'7iHfbu1YPACw6oZPAFJtqe'";
const CH = "'0D5wENdkdwbqlrHoaJ9g29'", PL = "'3cEYpjA9oz9GiPac4AsH4n'", DEV = "'0d1841b0976bae2a3a310dd74c0f3df354899bc8'";
const R = (removedBy) => ({ restricted: removedBy }); // endpoint has no public replacement
const OK = (code, what) => `\`{ status: ${code}, message }\` when ${what}`;

export const sections = {
  Albums: {
    getAlbum: { args: ALB, scopes: '', returns: 'Album object (`id`, `name`, `artists`, `images`, `release_date`, `tracks` page, …)' },
    getSeveralAlbums: { routed: true, args: `[${ALB}, '1A2GTWGtFfWp7KSQTwWOyo']`, scopes: '', returns: '`{ albums: Album[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getAlbumTracks: { args: ALB, scopes: '', returns: 'Paging object of simplified Track objects (`items`, `next`, `total`)' },
    getUsersSavedAlbums: { args: '', scopes: 'user-library-read', returns: 'Paging object of `{ added_at, album }`' },
    saveAlbumsForCurrentUser: { routed: true, args: `[${ALB}]`, scopes: 'user-library-modify', returns: OK(200, 'saved') },
    removeUsersSavedAlbums: { routed: true, args: `[${ALB}]`, scopes: 'user-library-modify', returns: OK(200, 'removed') },
    checkUsersSavedAlbums: { routed: true, args: `[${ALB}]`, scopes: 'user-library-read', returns: '`boolean[]` in the same order as the IDs' },
    getNewReleases: { args: '', scopes: '', returns: '`{ albums: Paging<Album> }`', ...R('GET /browse/new-releases') },
  },
  Artists: {
    getArtist: { args: ART, scopes: '', returns: 'Artist object (`id`, `name`, `genres`, `images`, …)' },
    getSeveralArtists: { routed: true, args: `[${ART}, '3dBVyJ7JuOMt4GE9607Qin']`, scopes: '', returns: '`{ artists: Artist[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getArtistsAlbums: { args: `${ART}, { include_groups: 'album,single', limit: 10 }`, scopes: '', returns: 'Paging object of simplified Album objects. Optional query: `include_groups`, `market`, `limit`, `offset`' },
    getArtistTopTracks: { args: `${ART}, 'US'`, scopes: '', returns: '`{ tracks: Track[] }`', ...R('GET /artists/{id}/top-tracks') },
    getArtistsRelatedArtists: { args: ART, scopes: '', returns: '`{ artists: Artist[] }`', restricted: 'GET /artists/{id}/related-artists' },
  },
  Audiobooks: {
    getAudiobook: { args: BOOK, scopes: '', returns: 'Audiobook object (`id`, `name`, `authors`, `narrators`, `chapters` page, …)' },
    getSeveralAudiobooks: { routed: true, args: `[${BOOK}]`, scopes: '', returns: '`{ audiobooks: Audiobook[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getAudiobookChapters: { args: BOOK, scopes: '', returns: 'Paging object of simplified Chapter objects' },
    getUsersSavedAudiobooks: { args: '', scopes: 'user-library-read', returns: 'Paging object of simplified Audiobook objects' },
    saveAudiobooksForCurrentUser: { routed: true, args: `[${BOOK}]`, scopes: 'user-library-modify', returns: OK(200, 'saved') },
    removeUsersSavedAudiobooks: { routed: true, args: `[${BOOK}]`, scopes: 'user-library-modify', returns: OK(200, 'removed') },
    checkUsersSavedAudiobooks: { routed: true, args: `[${BOOK}]`, scopes: 'user-library-read', returns: '`boolean[]` in input order' },
  },
  Categories: {
    getSeveralBrowseCategories: { args: '', scopes: '', returns: '`{ categories: Paging<Category> }`', ...R('GET /browse/categories') },
    getSingleBrowseCategory: { args: "'dinner'", scopes: '', returns: 'Category object (`id`, `name`, `icons`)', ...R('GET /browse/categories/{id}') },
  },
  Chapters: {
    getSingleChapter: { args: CH, scopes: '', returns: 'Chapter object (`id`, `name`, `duration_ms`, `audiobook`, …)' },
    getSeveralChapters: { routed: true, args: `[${CH}]`, scopes: '', returns: '`{ chapters: Chapter[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
  },
  Episodes: {
    getEpisode: { args: EP, scopes: 'user-read-playback-position (optional, for resume_point)', returns: 'Episode object (`id`, `name`, `description`, `duration_ms`, `show`, …)' },
    getSeveralEpisodes: { routed: true, args: `[${EP}]`, scopes: '', returns: '`{ episodes: Episode[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getUsersSavedEpisodes: { args: '', scopes: 'user-library-read', returns: 'Paging object of `{ added_at, episode }`' },
    saveEpisodesForCurrentUser: { routed: true, args: `[${EP}]`, scopes: 'user-library-modify', returns: OK(200, 'saved') },
    removeUsersSavedEpisodes: { routed: true, args: `[${EP}]`, scopes: 'user-library-modify', returns: OK(200, 'removed') },
    checkUsersSavedEpisodes: { routed: true, args: `[${EP}]`, scopes: 'user-library-read', returns: '`boolean[]` in input order' },
  },
  Genres: {
    getAvailableGenreSeeds: { args: '', scopes: '', returns: '`{ genres: string[] }`', restricted: 'GET /recommendations/available-genre-seeds' },
  },
  Library: {
    saveToLibrary: { args: "['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:album:4aawyAB9vmqN3uQ7FjRGTy']", scopes: 'user-library-modify (tracks/albums/episodes/shows/audiobooks), user-follow-modify (users), playlist-modify-public/private (playlists)', returns: OK(200, 'saved'), added: true },
    removeFromLibrary: { args: "['spotify:track:11dFghVXANMlKmJXsNCbNl']", scopes: 'Same as saveToLibrary', returns: OK(200, 'removed'), added: true },
    checkLibraryContains: { args: "['spotify:track:11dFghVXANMlKmJXsNCbNl', 'spotify:artist:0TnOYISbd1XYRBk9myaseg']", scopes: 'user-library-read and/or user-follow-read', returns: '`boolean[]` in the same order as the URIs (max 40)', added: true },
  },
  Markets: {
    getAvailableMarkets: { args: '', scopes: '', returns: '`{ markets: string[] }` (ISO 3166-1 alpha-2 codes)', ...R('GET /markets') },
  },
  Pagination: {
    getNext: { args: 'page.next', argsVar: "const page = await getUsersSavedTracks(accessToken); // page.next is e.g. 'https://api.spotify.com/v1/me/tracks?offset=20&limit=20'", scopes: 'Whatever the original endpoint needed', returns: 'The next Paging object. Prefer `paginate` / `getAll` for full iteration' },
  },
  Player: {
    getPlaybackState: { args: '', scopes: 'user-read-playback-state', returns: 'Playback state (`device`, `is_playing`, `progress_ms`, `item`, `shuffle_state`, `repeat_state`). Body is empty (204) when nothing is playing' },
    transferPlayback: { args: DEV, scopes: 'user-modify-playback-state', returns: OK(204, 'transferred'), premium: true },
    getAvailableDevices: { args: '', scopes: 'user-read-playback-state', returns: '`{ devices: Device[] }` (`id`, `name`, `type`, `is_active`, `volume_percent`)' },
    getCurrentlyPlayingTrack: { args: '', scopes: 'user-read-currently-playing', returns: 'Currently-playing object (`item`, `progress_ms`, `is_playing`, `currently_playing_type`)' },
    startPlayback: { args: `${DEV}, { contextUri: 'spotify:album:${ALB.slice(1, -1)}', offset: 2, positionMs: 0 }`, scopes: 'user-modify-playback-state', returns: OK(204, 'started. Omit deviceID to use the active device; pass `{ uris: [...] }` to play specific tracks'), premium: true },
    pausePlayback: { args: DEV, scopes: 'user-modify-playback-state', returns: OK(204, 'paused'), premium: true },
    skipToNextTrack: { args: DEV, scopes: 'user-modify-playback-state', returns: OK(204, 'skipped. Omit deviceID to target the active device'), premium: true },
    skipToPreviousTrack: { args: DEV, scopes: 'user-modify-playback-state', returns: OK(204, 'skipped back'), premium: true },
    seekToPosition: { args: `${DEV}, 30000`, scopes: 'user-modify-playback-state', returns: OK(204, 'seeked (positionMs in milliseconds)'), premium: true },
    setRepeatMode: { args: `'context', ${DEV}`, scopes: 'user-modify-playback-state', returns: OK(204, "set. state is 'track', 'context' or 'off'"), premium: true },
    setPlaybackVolume: { args: `50, ${DEV}`, scopes: 'user-modify-playback-state', returns: OK(204, 'set (0–100)'), premium: true },
    togglePlaybackShuffle: { args: `true, ${DEV}`, scopes: 'user-modify-playback-state', returns: OK(204, 'toggled'), premium: true },
    getRecentlyPlayedTracks: { optional: ['limit', 'before', 'after'], args: '20, undefined, Date.now() - 86400000', scopes: 'user-read-recently-played', returns: 'Cursor-paged object of `{ track, played_at, context }`' },
    getUserQueue: { args: '', scopes: 'user-read-currently-playing, user-read-playback-state', returns: '`{ currently_playing, queue: (Track|Episode)[] }`' },
    addItemToPlaybackQueue: { args: `'spotify:track:${TRK.slice(1, -1)}', ${DEV}`, scopes: 'user-modify-playback-state', returns: OK(204, 'queued'), premium: true },
  },
  Playlists: {
    getPlaylist: { args: PL, scopes: 'playlist-read-private (for private playlists)', returns: 'Playlist object. Since Feb 2026 `items` (formerly `tracks`) is only included for playlists you own or collaborate on' },
    changePlaylistDetails: { optional: ['name', 'isPublic', 'isCollaborative', 'description'], args: `${PL}, 'Road trip', false, false, 'Songs for the drive'`, scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(200, 'updated') },
    getPlaylistItems: { args: `${PL}, { limit: 50, fields: 'items(item(name,uri)),next' }`, scopes: 'playlist-read-private', returns: 'Paging object of playlist items (`items[].item`, `added_at`). Uses `GET /playlists/{id}/items`' },
    updatePlaylistItems: { args: `${PL}, undefined, 0, 5, 2, snapshotId`, argsVar: "// Move the first 2 items so they sit before position 5\nconst { snapshot_id: snapshotId } = await getPlaylist(accessToken, " + PL + ");", optional: ['uris', 'rangeStart', 'insertBefore', 'rangeLength'], scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(200, 'reordered/replaced. Pass `uris` to replace all items, or rangeStart/insertBefore/rangeLength to reorder') },
    addItemsToPlaylist: { optional: ['position'], args: `${PL}, ['spotify:track:${TRK.slice(1, -1)}', 'spotify:episode:${EP.slice(1, -1)}'], 0`, scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(201, 'added (1–100 URIs; throws on invalid count)') },
    removePlaylistItems: { args: `${PL}, ['spotify:track:${TRK.slice(1, -1)}']`, scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(200, 'removed. snapshotID is optional') },
    getCurrentUserPlaylists: { args: '', scopes: 'playlist-read-private, playlist-read-collaborative', returns: 'Paging object of simplified Playlist objects' },
    getUserPlaylists: { args: "'smedjan'", scopes: 'playlist-read-private, playlist-read-collaborative', returns: 'Paging object of simplified Playlist objects', ...R('GET /users/{id}/playlists (for your own playlists use getCurrentUserPlaylists)') },
    createPlaylist: { routed: true, optional: ['isPublic', 'isCollaborative', 'description'], args: "'your-user-id', 'New Playlist', false, false, 'Made with spotify-node-wrapper'", scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(201, 'created') },
    createPlaylistForCurrentUser: { args: "'New Playlist', { public: false, description: 'Made with spotify-node-wrapper' }", scopes: 'playlist-modify-public / playlist-modify-private', returns: 'The created Playlist object (`id`, `uri`, `snapshot_id`, …)', added: true },
    getFeaturedPlaylists: { args: '', scopes: '', returns: '`{ message, playlists: Paging<Playlist> }`', restricted: 'GET /browse/featured-playlists' },
    getCategoryPlaylists: { args: "'dinner'", scopes: '', returns: '`{ message, playlists: Paging<Playlist> }`', restricted: 'GET /browse/categories/{id}/playlists' },
    getPlaylistCoverImage: { args: PL, scopes: '', returns: '`Image[]` (`url`, `height`, `width`)' },
    addCustomPlaylistCoverImage: { args: `${PL}, base64Jpeg`, argsVar: "const base64Jpeg = (await fs.readFile('cover.jpg')).toString('base64'); // max 256 KB", scopes: 'ugc-image-upload, playlist-modify-public / playlist-modify-private', returns: OK(202, 'accepted') },
  },
  Search: {
    searchForItem: { args: "'Daft Punk', ['artist', 'track'], { limit: 10, market: 'US' }", scopes: '', returns: 'Object keyed by type (`artists`, `tracks`, …), each a Paging object. Since Feb 2026 limit max is 10 (default 5)' },
  },
  Shows: {
    getShow: { args: SHOW, scopes: 'user-read-playback-position (optional)', returns: 'Show object (`id`, `name`, `description`, `episodes` page, …)' },
    getSeveralShows: { routed: true, args: `[${SHOW}]`, scopes: '', returns: '`{ shows: Show[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getShowEpisodes: { args: SHOW, scopes: 'user-read-playback-position (optional)', returns: 'Paging object of simplified Episode objects' },
    getUsersSavedShows: { args: '', scopes: 'user-library-read', returns: 'Paging object of `{ added_at, show }`' },
    saveShowsForCurrentUser: { routed: true, args: `[${SHOW}]`, scopes: 'user-library-modify', returns: OK(200, 'saved') },
    removeUsersSavedShows: { routed: true, args: `[${SHOW}]`, scopes: 'user-library-modify', returns: OK(200, 'removed') },
    checkUsersSavedShows: { routed: true, args: `[${SHOW}]`, scopes: 'user-library-read', returns: '`boolean[]` in input order' },
  },
  Tracks: {
    getTrack: { args: TRK, scopes: '', returns: 'Track object (`id`, `name`, `artists`, `album`, `duration_ms`, `uri`, …)' },
    getSeveralTracks: { routed: true, args: `[${TRK}, '7ouMYWpwJ422jRcDASZB7P']`, scopes: '', returns: '`{ tracks: Track[] }` in input order; unknown IDs become `null`. Fetched one by one (5 at a time)' },
    getUsersSavedTracks: { args: '', scopes: 'user-library-read', returns: 'Paging object of `{ added_at, track }`' },
    saveTracksForCurrentUser: { routed: true, args: `[${TRK}]`, scopes: 'user-library-modify', returns: OK(200, 'saved') },
    removeUsersSavedTracks: { routed: true, args: `[${TRK}]`, scopes: 'user-library-modify', returns: OK(200, 'removed') },
    checkUsersSavedTracks: { routed: true, args: `[${TRK}]`, scopes: 'user-library-read', returns: '`boolean[]` in input order' },
    getTracksAudioFeatures: { args: `[${TRK}]`, scopes: '', returns: '`{ audio_features: AudioFeatures[] }`', restricted: 'GET /audio-features' },
    getTrackAudioFeatures: { args: TRK, scopes: '', returns: 'AudioFeatures object (`danceability`, `energy`, `tempo`, …)', restricted: 'GET /audio-features/{id}' },
    getTrackAudioAnalysis: { args: TRK, scopes: '', returns: 'Audio analysis (`bars`, `beats`, `sections`, `segments`, `tatums`)', restricted: 'GET /audio-analysis/{id}' },
    getRecommendations: { args: `{ seed_artists: ${ART}, seed_genres: 'classical', limit: 10 }`, scopes: '', returns: '`{ seeds, tracks: Track[] }`', restricted: 'GET /recommendations' },
  },
  Users: {
    getCurrentUserProfile: { args: '', scopes: 'user-read-private (optional)', returns: 'User object (`id`, `display_name`, `images`, `uri`). `email`, `country`, `product`, `followers` were removed Feb 2026' },
    getUsersTopItems: { args: "'tracks', { time_range: 'short_term', limit: 10 }", scopes: 'user-top-read', returns: "Paging object of Artist or Track objects. type is 'artists' or 'tracks'; optional `time_range`, `limit`, `offset`" },
    getUserProfile: { args: "'smedjan'", scopes: '', returns: 'Public User object', ...R('GET /users/{id}') },
    followPlaylist: { routed: true, optional: ['isPublic'], args: `${PL}, true`, scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(200, 'followed') },
    unfollowPlaylist: { routed: true, optional: ['isPublic'], args: PL, scopes: 'playlist-modify-public / playlist-modify-private', returns: OK(200, 'unfollowed') },
    getFollowedArtists: { args: '', scopes: 'user-follow-read', returns: '`{ artists: CursorPaging<Artist> }`' },
    followArtistsOrUsers: { routed: true, args: `[${ART}]`, scopes: 'user-follow-modify', returns: OK(204, 'followed') },
    unfollowArtistsOrUsers: { routed: true, args: `[${ART}]`, scopes: 'user-follow-modify', returns: OK(204, 'unfollowed') },
    checkUserFollowsArtistsOrUsers: { routed: true, args: `[${ART}]`, scopes: 'user-follow-read', returns: '`boolean[]` in input order' },
    checkUsersFollowPlaylist: { routed: true, args: `${PL}, ['your-user-id']`, scopes: 'user-follow-read', returns: '`{ response: boolean[] }`. Spotify can now only check the current user, so other user IDs return `false`' },
  },
};
