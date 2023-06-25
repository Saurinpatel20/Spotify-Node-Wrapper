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
   const { getAlbum, searchTracks } = require('spotify-node-wrapper');
   ```

2. Obtain an access token from Spotify using the necessary authentication flow. This access token is required to make authorized requests to the Spotify API.

3. Call the desired function, passing in the access token and any other necessary parameters. For example, to retrieve an album:

   ```javascript
   const accessToken = 'your-access-token';
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

   You can similarly call other functions such as `searchTracks`, passing in the access token and relevant parameters.

4. Make sure you handle asynchronous operations properly by using `async/await` or promises, depending on your preference and the capabilities of the functions you are using.

Make sure to replace `'your-access-token'` and `'your-album-id'` with the actual values for your application. Additionally, ensure proper error handling in your code to handle any potential errors that may occur during the API requests.

## API Reference

Yet to be completed. Refer to code for more information until this is complete.

### getAlbum
Retrieves detailed information about a specific album.

### getSeveralAlbums
Retrieves detailed information about multiple albums in a single request.

### getAlbumTracks
Retrieves the tracks of a specific album.

### getUsersSavedAlbums
Retrieves a list of albums saved in the user's library.

### saveAlbumsForCurrentUser
Saves one or more albums to the user's library.

### removeUsersSavedAlbums
Removes one or more albums from the user's library.

### checkUsersSavedAlbums
Checks if one or more albums are saved in the user's library.

### getNewReleases
Retrieves a list of new album releases.

### getArtist
Retrieves detailed information about a specific artist.

### getSeveralArtists
Retrieves detailed information about multiple artists in a single request.

### getArtistsAlbums
Retrieves the albums of a specific artist.

### getArtistTopTracks
Retrieves the top tracks of a specific artist.

### getArtistsRelatedArtists
Retrieves a list of artists related to a specific artist.

### getAudiobook
Retrieves detailed information about a specific audiobook.

### getSeveralAudiobooks
Retrieves detailed information about multiple audiobooks in a single request.

### getAudiobookChapters
Retrieves the chapters of a specific audiobook.

### getUsersSavedAudiobooks
Retrieves a list of audiobooks saved in the user's library.

### saveAudiobooksForCurrentUser
Saves one or more audiobooks to the user's library.

### removeUsersSavedAudiobooks
Removes one or more audiobooks from the user's library.

### checkUsersSavedAudiobooks
Checks if one or more audiobooks are saved in the user's library.

### getSeveralBrowseCategories
Retrieves detailed information about multiple browse categories in a single request.

### getSingleBrowseCategory
Retrieves detailed information about a specific browse category.

### getSingleChapter
Retrieves detailed information about a specific chapter of an audiobook.

### getSeveralChapters
Retrieves detailed information about multiple chapters of an audiobook in a single request.

### getEpisode
Retrieves detailed information about a specific episode of a show or podcast.

### getSeveralEpisodes
Retrieves detailed information about multiple episodes of shows or podcasts in a single request.

### getUsersSavedEpisodes
Retrieves a list of episodes saved in the user's library.

### saveEpisodesForCurrentUser
Saves one or more episodes to the user's library.

### removeUsersSavedEpisodes
Removes one or more episodes from the user's library.

### checkUsersSavedEpisodes
Checks if one or more episodes are saved in the user's library.

### getAvailableGenreSeeds
Retrieves a list of available genre seeds for recommendations.

### getNext
Retrieves the next set of items from a previously fetched paginated endpoint.

### getAvailableMarkets
Retrieves a list of available markets for playback.

### getPlaybackState
Retrieves the playback state, including the currently playing track, from the user's active device.

### transferPlayback
Transfers playback to a different device.

### getAvailableDevices
Retrieves a list of available devices for playback.

### getCurrentlyPlayingTrack
Retrieves the currently playing track from the user's active device.

### startPlayback
Starts or resumes playback on the user's active device.

### pausePlayback
Pauses playback on the user's active device.

### skipToNextTrack
Skips to the next track in the user's playback queue.

### skipToPreviousTrack
Skips to the previous track in the user's playback queue.

### seekToPosition
Seeks to a specified position in the currently playing track.

### setRepeatMode
Sets the repeat mode for the user's playback.

### setPlaybackVolume
Sets the volume for the user's active device.

### togglePlaybackShuffle
Toggles the shuffle mode for the user's playback.

### getRecentlyPlayedTracks
Retrieves a list of the user's recently played tracks.

### getUserQueue
Retrieves the user's playback queue.

### addItemToPlaybackQueue
Adds an item to the user's playback queue.

### getPlaylist
Retrieves detailed information about a specific playlist.

### changePlaylistDetails
Changes the details of a specific playlist.

### getPlaylistItems
Retrieves the items (tracks or episodes) of a specific playlist.

### updatePlaylistItems
Updates the items (tracks or episodes) of a specific playlist.

### addItemsToPlaylist
Adds items (tracks or episodes) to a specific playlist.

### removePlaylistItems
Removes items (tracks or episodes) from a specific playlist.

### getCurrentUserPlaylists
Retrieves a list of playlists owned or followed by the current user.

### getUserPlaylists
Retrieves a list of playlists owned or followed by a specific user.

### createPlaylist
Creates a new playlist for the current user.

### getFeaturedPlaylists
Retrieves a list of featured playlists.

### getCategoryPlaylists
Retrieves a list of playlists within a specific category.

### getPlaylistCoverImage
Retrieves the cover image of a specific playlist.

### addCustomPlaylistCoverImage
Adds a custom cover image to a specific playlist.

### searchForItem
Searches for items (tracks, albums, artists, playlists, etc.) based on a query.

### getShow
Retrieves detailed information about a specific show or podcast.

### getSeveralShows
Retrieves detailed information about multiple shows or podcasts in a single request.

### getShowEpisodes
Retrieves the episodes of a specific show or podcast.

### getUsersSavedShows
Retrieves a list of shows or podcasts saved in the user's library.

### saveShowsForCurrentUser
Saves one or more shows or podcasts to the user's library.

### removeUsersSavedShows
Removes one or more shows or podcasts from the user's library.

### checkUsersSavedShows
Checks if one or more shows or podcasts are saved in the user's library.

### getTrack
Retrieves detailed information about a specific track.

### getSeveralTracks
Retrieves detailed information about multiple tracks in a single request.

### getUsersSavedTracks
Retrieves a list of tracks saved in the user's library.

### saveTracksForCurrentUser
Saves one or more tracks to the user's library.

### removeUsersSavedTracks
Removes one or more tracks from the user's library.

### checkUsersSavedTracks
Checks if one or more tracks are saved in the user's library.

### getTracksAudioFeatures
Retrieves audio features (such as danceability, tempo, etc.) for multiple tracks in a single request.

### getTrackAudioFeatures
Retrieves audio features (such as danceability, tempo, etc.) for a specific track.

### getTrackAudioAnalysis
Retrieves a detailed audio analysis of a specific track.

### getRecommendations
Generates a list of recommended tracks based on a variety of seeds (such as artists, genres, etc.).

### getCurrentUserProfile
Retrieves the current user's profile information.

### getUsersTopItems
Retrieves a list of the user's top tracks or artists.

### getUserProfile
Retrie

ves the profile information of a specific user.

### followPlaylist
Follows a specific playlist.

### unfollowPlaylist
Unfollows a specific playlist.

### getFollowedArtists
Retrieves a list of artists followed by the user.

### followArtistsOrUsers
Follows one or more artists or users.

### unfollowArtistsOrUsers
Unfollows one or more artists or users.

### checkUserFollowsArtistsOrUsers
Checks if the user follows one or more artists or users.

### checkUsersFollowPlaylist
Checks if one or more users follow a specific playlist.

## Official API documentation
Please refer to the [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference/) for detailed information about the available endpoints and their parameters.

## Contributing

Contributions to the Spotify Node Wrapper are welcome! If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/Saurinpatel20/spotify-node-wrapper). You can also submit pull requests with proposed changes.

When contributing code, please ensure that your changes follow appropriate coding style and include tests if possible. Additionally, provide a thorough description of the changes in your pull request.

## Acknowledgements

The Spotify Node Wrapper was developed by [Saurin Patel](https://github.com/Saurinpatel20) and is inspired by the [Spotify Web API](https://developer.spotify.com/documentation/web-api/).

## Disclaimer

This package is not officially associated with Spotify. It is an independent project created by developers for developers to simplify working with the Spotify Web API.