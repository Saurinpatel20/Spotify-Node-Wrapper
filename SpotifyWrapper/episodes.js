import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get Spotify catalog information for a single episode identified by their unique Spotify ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} episodeID - The ID of the episode to retrieve information for.
 * @throws {Error} Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
 */
const getEpisode = async (accessToken, episodeID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}episodes/${episodeID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for several episodes based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfEpisodeID - An array of Spotify IDs representing the episodes to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
*/
const getSeveralEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episode IDs in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfEpisodeID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}episodes${ids}`, options);
    return response.json();
}

/**
 * Get a list of episodes the user has saved in their Spotify library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
 */
const getUsersSavedEpisodes = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

/**
 * Save one or more episodes to the user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfEpisodeID - An array of Spotify IDs representing the episodes to save.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
 */
const saveEpisodesForCurrentUser = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episodes in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

/**
 * Remove one or more episodes from the user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfEpisodeID - An array of Spotify IDs representing the episodes to remove.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
 */
const removeUsersSavedEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episodes in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

/**
 * Check if one or more episodes is already saved in the current Spotify user's library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfEpisodeID - An array of Spotify IDs representing the episodes to check.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the episode information.
 */
const checkUsersSavedEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episode IDs in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/episodes/contains?ids=${ids}`, options);
    return response.json();
}

export {
    getEpisode,
    getSeveralEpisodes,
    getUsersSavedEpisodes,
    saveEpisodesForCurrentUser,
    removeUsersSavedEpisodes,
    checkUsersSavedEpisodes,
};