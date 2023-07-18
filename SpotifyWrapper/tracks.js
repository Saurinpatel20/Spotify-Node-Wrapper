import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get a track from the Spotify API.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {string} trackID - The Spotify ID of the track.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the track.
 */
const getTrack = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}tracks/${trackID}`, options);
    return response.json();
}

/**
 * Get a list of tracks from the Spotify API.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} listOfTrackID - The list of track IDs to retrieve from the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the tracks.
 */
const getSeveralTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many track IDs in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfTrackID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}tracks${ids}`, options);
    return response.json();
}

/**
 * Get the current user's saved tracks from the Spotify API.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the tracks.
 */
const getUsersSavedTracks = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks`, options);
    return response.json();
}

/**
 * Save one or more tracks to the current user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} listOfTrackID - The list of track IDs to save to the user's library.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the response code.
 */
const saveTracksForCurrentUser = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfTrackID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The tracks were successfully saved.",
        };
    }
}

/**
 * Remove one or more tracks from the current user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} listOfTrackID - The list of track IDs to remove from the user's library.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the response code.
 */
const removeUsersSavedTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfTrackID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The tracks were successfully removed.",
        };
    }
}

/**
 * Check if one or more tracks is already saved in the current Spotify user's "Your Music" library.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} listOfTrackID - The list of track IDs to check if they are saved in the user's library.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the response code.
 */
const checkUsersSavedTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfTrackID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks/contains${ids}`, options);

    return {
        response: await response.json(),
    };
}

/**
 * Get audio features for multiple tracks based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} listOfTrackID - The list of track IDs to get audio features for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the audio features.
 */
const getTracksAudioFeatures = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 100) {
        return {
            status: "400",
            message: "You have too many track IDs in your array. Max: 100 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfTrackID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}audio-features${ids}`, options);
    return response.json();
}

/**
 * Get audio features for a singular track based on the Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} trackID - A track ID to get audio features for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the audio features.
 */
const getTrackAudioFeatures = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}audio-features/${trackID}`, options);
    return response.json();
}

/**
 * Get audio analysis for a singular track based on the Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {array} trackID - A track ID to get audio analysis for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the audio analysis.
 */
const getTrackAudioAnalysis = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}audio-analysis/${trackID}`, options);
    return response.json();
}

/**
 * Get recommendations based on seeds (artists, tracks, and genres).
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {object} queryParams - The query parameters to be passed in the request.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing the recommendations.
 */
const getRecommendations = async (accessToken, queryParams) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    let queryString = '?';
    
    for (const key in queryParams) {
        if (Object.hasOwnProperty.call(queryParams, key)) {
            queryString += `${key}=${queryParams[key]}&`;
        }
    }
    
    queryString = queryString.slice(0, -1);
    
    const response = await fetch(`${baseURI}recommendations${queryString}`, options);
    return response.json();
}

export {
    getTrack,
    getSeveralTracks,
    getUsersSavedTracks,
    saveTracksForCurrentUser,
    removeUsersSavedTracks,
    checkUsersSavedTracks,
    getTracksAudioFeatures,
    getTrackAudioFeatures,
    getTrackAudioAnalysis,
    getRecommendations,
};
