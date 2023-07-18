import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get the playlist with the specified playlist ID
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {*} playlistID - The ID of the playlist to be retrieved
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist information.
 */
const getPlaylist = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}`, options);
    return response.json();
}

/**
 * Change the details of a playlist to the specified information.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to be updated.
 * @param {string} name - The new name of the playlist.
 * @param {boolean} isPublic - Whether the playlist should be public or not.
 * @param {boolean} isCollaborative - Whether the playlist should be collaborative or not.
 * @param {string} description - The new description of the playlist.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist information.
 */
const changePlaylistDetails = async (accessToken, playlistID, name, isPublic, isCollaborative, description) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            public: isPublic,
            collaborative: isCollaborative,
            description: description,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Playlist details updated successfully.`,
        };
    }
}

/**
 * Get the items in the playlist with the specified playlist ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to get the items of.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist items.
 */
const getPlaylistItems = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    return response.json();
}

/**
 * Update the items in the playlist with the specified playlist ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to update the items of.
 * @param {string[]} uris - An array of Spotify track URIs to add to the playlist.
 * @param {number} rangeStart - The position of the first item to replace.
 * @param {number} insertBefore - The position where the new items should be inserted.
 * @param {number} rangeLength - The number of items to be replaced.
 * @param {string} snapshotID - The playlist's snapshot ID against which you want to make the changes.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist items.
 */
const updatePlaylistItems = async (accessToken, playlistID, uris, rangeStart, insertBefore, rangeLength, snapshotID) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: uris,
            range_start: rangeStart,
            insert_before: insertBefore,
            range_length: rangeLength,
            snapshot_id: snapshotID,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Playlist items updated successfully.`,
        };
    }
}

/**
 * Add items to the playlist with the specified playlist ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to update the items of.
 * @param {string[]} uris - An array of Spotify track URIs to add to the playlist.
 * @param {number} position - The position where the new items should be inserted.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist items.
 */
const addItemsToPlaylist = async (accessToken, playlistID, uris, position) => {
    if (uris.length === 0 || uris.length > 100) {
        throw new Error("Invalid number of URIs. The URIs array should contain between 1 and 100 elements.");
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: uris,
            position: position,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 201) {
        return {
            status: 201,
            message: `Items added to the playlist successfully.`,
        };
    }
}

/**
 * Remove items from the playlist with the specified playlist ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to update the items of.
 * @param {string[]} uris - An array of Spotify track URIs to add to the playlist.
 * @param {string} snapshotID - The playlist's snapshot ID against which you want to make the changes.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist items.
 */
const removePlaylistItems = async (accessToken, playlistID, uris, snapshotID) => {
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tracks: uris,
            snapshot_id: snapshotID,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Items removed from the playlist successfully.`,
        };
    }
}

/**
 * Get a list of the current user's playlists.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playlists.
 */
const getCurrentUserPlaylists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/playlists`, options);
    return response.json();
}

/**
 * Get a list of the current user's playlists.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} userID - The ID of the user whose playlists are to be retrieved.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playlists.
 */
const getUserPlaylists = async (accessToken, userID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}users/${userID}/playlists`, options);
    return response.json();
}

/**
 * Create a new playlist for the current user.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} userID - The ID of the user to create the playlist for.
 * @param {string} name - The name of the playlist.
 * @param {boolean} isPublic - Whether the playlist should be public or not.
 * @param {boolean} isCollaborative - Whether the playlist should be collaborative or not.
 * @param {string} description - A description of the playlist.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist.
 */
const createPlaylist = async (accessToken, userID, name, isPublic, isCollaborative, description) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            public: isPublic,
            collaborative: isCollaborative,
            description: description,
        }),
    };
    
    const response = await fetch(`${baseURI}users/${userID}/playlists`, options);
    
    if (response.status === 201) {
        return {
            status: 201,
            message: `Playlist created successfully.`,
        };
    }
}

/**
 * Get an object consisting of Spotify featured playlists.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the featured playlists.
 */
const getFeaturedPlaylists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}browse/featured-playlists`, options);
    return response.json();
}

/**
 * Get a list of Spotify category playlists.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} categoryID - The ID of the category to get playlists for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the featured playlists.
 */
const getCategoryPlaylists = async (accessToken, categoryID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories/${categoryID}/playlists`, options);
    return response.json();
}

/**
 * Get the playlist cover image given the ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to get the cover image for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist cover image.
 */
const getPlaylistCoverImage = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/images`, options);
    return response.json();
}

/**
 * Add a custom cover image to a playlist.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistID - The ID of the playlist to add the cover image to.
 * @param {string} image - The image to use as the cover image.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the playlist cover image.
 */
const addCustomPlaylistCoverImage = async (accessToken, playlistID, image) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg',
        },
        body: image,
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/images`, options);
    
    if (response.status === 202) {
        return {
            status: 202,
            message: `Custom playlist cover image added successfully.`,
        };
    }
}

export {
    getPlaylist,
    changePlaylistDetails,
    getPlaylistItems,
    updatePlaylistItems,
    addItemsToPlaylist,
    removePlaylistItems,
    getCurrentUserPlaylists,
    getUserPlaylists,
    createPlaylist,
    getFeaturedPlaylists,
    getCategoryPlaylists,
    getPlaylistCoverImage,
    addCustomPlaylistCoverImage,
};
