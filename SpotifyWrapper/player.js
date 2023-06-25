import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

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
