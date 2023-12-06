# Spotify Node Wrapper

The Spotify Node Wrapper is a Node.js package that provides a simplified interface to interact with the Spotify Web API. It wraps the various endpoints of the Spotify API and creates functions for each endpoint, allowing for quick and easy access to Spotify's data without the need to manually handle the fetching and parsing of data.

## Installation

To install the Spotify Node Wrapper, you can use npm (Node Package Manager). Open your terminal or command prompt and run the following command:

```bash
npm install spotify-node-wrapper
```

## Usage

To use the Spotify Node Wrapper in your Node.js project, follow these steps:

1. Require the package in your code:

   ```javascript
   const { getSpotifyAccessToken, getAlbum } = require('spotify-node-wrapper');
   ```

2. Obtain an access token from Spotify using the necessary authentication flow. This access token is required to make authorized requests to the Spotify API.
    ```javascript
    const accessToken = await getSpotifyAccessToken('your-client-id', 'your-client-secret', 'your-redirect-uri')
    ```

3. Call the desired function, passing in the access token and any other necessary parameters. For example, to retrieve an album:

   ```javascript
   const albumId = 'your-album-id';

   getAlbum(accessToken, albumId)
     .then((album) => {
       // Handle the album data
       console.log(album);
     })
     .catch((error) => {
       // Handle any errors
       console.error(error);
     });
   ```

   You can similarly call other functions, passing in the access token and relevant parameters.

4. Make sure you handle asynchronous operations properly by using `async/await` or promises, depending on your preference and the capabilities of the functions you are using.

Make sure to replace `'your-album-id'` with the actual values for your use case. Additionally, ensure proper error handling in your code to handle any potential errors that may occur during the API requests.

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