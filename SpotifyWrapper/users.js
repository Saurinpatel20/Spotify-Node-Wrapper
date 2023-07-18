import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get the current user's profile.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's profile.
 */
const getCurrentUserProfile = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `'Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me`, options);
    return response.json();
}

/**
 * Get the current user's top artists or tracks.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} type - The type of item to get. Valid values are 'artists' or 'tracks'.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's top artists or tracks.
 */
const getUsersTopItems = async (accessToken, type) => {
    const validTypes = ['artists', 'tracks'];
    if (!validTypes.includes(type)) {
        return {
            status: "400",
            message: "Invalid type. Allowed values: 'artists', 'tracks'.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me/top/${type}`, options);
    return response.json();
}

/**
 * Get a user's profile.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} userId - The user's Spotify user ID.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's profile.
 */
const getUserProfile = async (accessToken, userId) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}users/${userId}`, options);
    return response.json();
}

/**
 * Let a user follow a playlist.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistId - The ID of the playlist to follow.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's profile.
 */
const followPlaylist = async (accessToken, playlistId, isPublic = true) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            public: isPublic
        })
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers`, options);

    if (response.status == 200) {
        return {
            status: 200,
            message: "Successfully followed the playlist.",
        };
    }
}

/**
 * Let a user unfollow a playlist.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistId - The ID of the playlist to unfollow.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's profile.
 */
const unfollowPlaylist = async (accessToken, playlistId) => {
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers`, options);

    if (response.status == 200) {
        return {
            status: 200,
            message: "Successfully unfollowed the playlist.",
        };
    }
}

/**
 * Get the current user's followed artists.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's followed artists.
 */
const getFollowedArtists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me/following`, options);
    return response.json();
}

/**
 * Follow one or more artists or users.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} ids - The IDs of the artists or users to follow.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's followed artists.
 */
const followArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}me/following?type=artist,user&ids=${ids.join(',')}`, options);

    if (response.status == 204) {
        return {
            status: 204,
            message: "Successfully followed artists or users.",
        };
    }
}

/**
 * Unfollow one or more artists or users.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} ids - The IDs of the artists or users to unfollow.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's followed artists.
 */
const unfollowArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}me/following?type=artist,user&ids=${ids.join(',')}`, options);

    if (response.status == 204) {
        return {
            status: 204,
            message: "Successfully unfollowed artists or users.",
        };
    }
}

/**
 * Check if one or more artists or users are followed by the current user.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} ids - The IDs of the artists or users to check.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's followed artists.
 */
const checkUserFollowsArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${baseURI}me/following/contains?type=artist,user&ids=${ids.join(',')}`, options);

    return {
        response: await response.json(),
    };
}

/**
 * Check if one or more users follow a playlist.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} playlistId - The ID of the playlist to check.
 * @param {string[]} userIds - The IDs of the users to check.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the current user's followed artists.
 */
const checkUsersFollowPlaylist = async (accessToken, playlistId, userIds) => {
    if (userIds.length === 0 || userIds.length > 5) {
        return {
            status: "400",
            message: "Invalid number of user ids. The number of ids must be between 0 and 5.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers/contains?ids=${userIds.join(',')}`, options);

    return {
        response: await response.json(),
    };
}

export {
    getCurrentUserProfile,
    getUsersTopItems,
    getUserProfile,
    followPlaylist,
    unfollowPlaylist,
    getFollowedArtists,
    followArtistsOrUsers,
    unfollowArtistsOrUsers,
    checkUserFollowsArtistsOrUsers,
    checkUsersFollowPlaylist,
}
