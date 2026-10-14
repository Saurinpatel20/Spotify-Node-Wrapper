import fetch from './http.js';
import { toUris, artistOrUser, libraryWrite, libraryContains, fetchEach } from './library.js';

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
            'Authorization': `Bearer ${accessToken}`,
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
const getUsersTopItems = async (accessToken, type, query = {}) => {
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

    const response = await fetch(`${baseURI}me/top/${type}${Object.keys(query).length ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))}` : ''}`, options);
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
    // Routed through PUT /me/library (Feb 2026). `isPublic` is accepted for compatibility;
    // the new endpoint has no visibility option.
    const error = await libraryWrite('PUT', accessToken, toUris([playlistId], 'playlist'));
    if (error) return error;
    return { status: 200, message: "Successfully followed the playlist." };
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
    // Routed through DELETE /me/library (Feb 2026).
    const error = await libraryWrite('DELETE', accessToken, toUris([playlistId], 'playlist'));
    if (error) return error;
    return { status: 200, message: "Successfully unfollowed the playlist." };
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
    if (!Array.isArray(ids) || ids.length === 0) {
        return { status: "400", message: "You passed in no artist or user IDs in the array." };
    }
    // Routed through PUT /me/library (Feb 2026). 22-char base62 IDs are treated as artists,
    // other IDs as users; pass full URIs (spotify:user:...) to be explicit.
    const error = await libraryWrite('PUT', accessToken, toUris(ids, artistOrUser));
    if (error) return error;
    return { status: 204, message: "Successfully followed the artists or users." };
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
    if (!Array.isArray(ids) || ids.length === 0) {
        return { status: "400", message: "You passed in no artist or user IDs in the array." };
    }
    // Routed through DELETE /me/library (Feb 2026). 22-char base62 IDs are treated as artists,
    // other IDs as users; pass full URIs (spotify:user:...) to be explicit.
    const error = await libraryWrite('DELETE', accessToken, toUris(ids, artistOrUser));
    if (error) return error;
    return { status: 204, message: "Successfully unfollowed the artists or users." };
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
    if (!Array.isArray(ids) || ids.length === 0) {
        return { status: "400", message: "You passed in no artist or user IDs in the array." };
    }
    // Routed through GET /me/library/contains (Feb 2026); returns boolean[] in input order.
    return libraryContains(accessToken, toUris(ids, artistOrUser));
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
    if (!Array.isArray(userIds) || userIds.length === 0 || userIds.length > 5) {
        return {
            status: "400",
            message: "Invalid number of user ids. The number of ids must be between 1 and 5.",
        };
    }
    // Spotify (Feb 2026) can only check the *current* user, via GET /me/library/contains.
    // IDs other than the current user's resolve to false.
    const me = await (await fetch(`${baseURI}me`, { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } })).json();
    if (!me || !me.id) return { response: me };
    const follows = await libraryContains(accessToken, toUris([playlistId], 'playlist'));
    if (!Array.isArray(follows)) return { response: follows };
    return { response: userIds.map((id) => id === me.id && follows[0] === true) };
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
