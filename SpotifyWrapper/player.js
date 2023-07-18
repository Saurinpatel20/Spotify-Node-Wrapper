import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get information about the user's current playback state, including track, track progress, and active device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const getPlaybackState = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/player`, options);
    return response.json();
}

/**
 * Transfer the user's playback to a new device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device to transfer playback to.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const transferPlayback = async (accessToken, deviceID) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            device_ids: [deviceID],
        }),
    };
    
    const response = await fetch(`${baseURI}me/player`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Playback transferred successfully.",
        };
    }
}

/**
 * Get information about the user's currently available devices.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the available devices.
 */
const getAvailableDevices = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/player/devices`, options);
    return response.json();
}

/**
 * Get the user's current playback, including track, track progress, and active device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's current playback.
 */
const getCurrentlyPlayingTrack = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/player/currently-playing`, options);
    return response.json();
}

/**
 * Starts the playback on the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const startPlayback = async (accessToken, deviceID) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/play?device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Playback started/resumed successfully.",
        };
    }
}

/**
 * Pauses the playback on the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const pausePlayback = async (accessToken, deviceID) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/pause?device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Playback paused successfully.",
        };
    }
}

/**
 * Skips to the next track in the queue for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const skipToNextTrack = async (accessToken, deviceID) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/next?device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Skipped to the next track successfully.",
        };
    }
}

/**
 * Skips to the previous track in the queue for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const skipToPreviousTrack = async (accessToken, deviceID) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/previous?device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Skipped to the previous track successfully.",
        };
    }
}

/**
 * Seeks to the specified position in the currently playing track for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} deviceID - The ID of the device
 * @param {number} positionMs - The position in milliseconds to seek to. Must be a positive number.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const seekToPosition = async (accessToken, deviceID, positionMs) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/seek?device_id=${deviceID}&position_ms=${positionMs}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Seeked to the specified position successfully.",
        };
    }
}

/**
 * Sets the repeat mode for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} state - The state of the repeat mode. Must be one of 'context', 'track', or 'off'.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const setRepeatMode = async (accessToken, state, deviceID) => {
    if (!["context", "track", "off"].includes(state)) {
        throw new Error("Invalid state. Allowed values are 'context', 'track', or 'off'.");
    }
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/repeat?device_id=${deviceID}&state=${state}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: `Repeat mode set to '${state}' successfully.`,
        };
    }
}

/**
 * Sets the volume for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {number} volumePercent - The volume percentage to set. Must be a number between 0 and 100.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const setPlaybackVolume = async (accessToken, volumePercent, deviceID) => {
    if (volumePercent < 0 || volumePercent > 100) {
        throw new Error("Invalid volume percentage. Allowed values are between 0 and 100.");
    }
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/volume?volume_percent=${volumePercent}&device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: `Playback volume set to ${volumePercent}% successfully.`,
        };
    }
}

/**
 * Toggles shuffle mode for the specified device.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {boolean} state - The state of the shuffle mode. Must be either 'true' or 'false'.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const togglePlaybackShuffle = async (accessToken, state, deviceID) => {
    if (typeof state !== "boolean") {
        throw new Error("Invalid state. Allowed values are 'true' or 'false'.");
    }
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/shuffle?device_id=${deviceID}&state=${state}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: `Playback shuffle set to '${state}' successfully.`,
        };
    }
}

/**
 * Get the recently played tracks from the playback queue.
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {number} limit - The number of tracks to return. Must be between 1 and 50.
 * @param {number} before - A Unix timestamp in milliseconds. Returns all tracks played before this timestamp. Must be before the current time.
 * @param {number} after - A Unix timestamp in milliseconds. Returns all tracks played after this timestamp. Must be before the current time.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's recently played tracks.
 */
const getRecentlyPlayedTracks = async (accessToken, limit = 20, before = undefined, after = undefined) => {
    let url = `${baseURI}me/player/recently-played?limit=${limit}`;
    
    if (before) {
        url += `&before=${before}`;
    }
    
    if (after) {
        url += `&after=${after}`;
    }
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(url, options);
    return response.json();
}

/**
 * Get the user's playback queue.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback queue.
 */
const getUserQueue = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/player/queue`, options);
    return response.json();
}

/**
 * Adds an item to the user's playback queue.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} uri - The URI of the item to add to the playback queue.
 * @param {string} deviceID - The ID of the device
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's playback state.
 */
const addItemToPlaybackQueue = async (accessToken, uri, deviceID) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            uri: uri,
        }),
    };
    
    const response = await fetch(`${baseURI}me/player/queue?device_id=${deviceID}`, options);
    
    if (response.status === 204) {
        return {
            status: 204,
            message: "Item added to playback queue successfully.",
        };
    }
}

export {
    getPlaybackState,
    transferPlayback,
    getAvailableDevices,
    getCurrentlyPlayingTrack,
    startPlayback,
    pausePlayback,
    skipToNextTrack,
    skipToPreviousTrack,
    seekToPosition,
    setRepeatMode,
    setPlaybackVolume,
    togglePlaybackShuffle,
    getRecentlyPlayedTracks,
    getUserQueue,
    addItemToPlaybackQueue,
};
