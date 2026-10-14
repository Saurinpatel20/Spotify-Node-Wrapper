import fetch from './http.js';
import { toUris, artistOrUser, libraryWrite, libraryContains, fetchEach } from './library.js';

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
    if (!Array.isArray(listOfEpisodeID) || listOfEpisodeID.length === 0) {
        return { status: "400", message: "You passed in no episode IDs in the array." };
    }
    // The batch endpoint was removed (Feb 2026); fetch each item individually (5 at a time).
    return { episodes: await fetchEach(listOfEpisodeID, (id) => getEpisode(accessToken, id)) };
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
    if (!Array.isArray(listOfEpisodeID) || listOfEpisodeID.length === 0) {
        return { status: "400", message: "You passed in no episode IDs in the array." };
    }
    // Routed through PUT /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('PUT', accessToken, toUris(listOfEpisodeID, 'episode'));
    if (error) return error;
    return { status: 200, message: "The episodes were successfully saved." };
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
    if (!Array.isArray(listOfEpisodeID) || listOfEpisodeID.length === 0) {
        return { status: "400", message: "You passed in no episode IDs in the array." };
    }
    // Routed through DELETE /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('DELETE', accessToken, toUris(listOfEpisodeID, 'episode'));
    if (error) return error;
    return { status: 200, message: "The episodes were successfully removed." };
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
    if (!Array.isArray(listOfEpisodeID) || listOfEpisodeID.length === 0) {
        return { status: "400", message: "You passed in no episode IDs in the array." };
    }
    // Routed through GET /me/library/contains (Feb 2026); returns boolean[] in input order.
    return libraryContains(accessToken, toUris(listOfEpisodeID, 'episode'));
}

export {
    getEpisode,
    getSeveralEpisodes,
    getUsersSavedEpisodes,
    saveEpisodesForCurrentUser,
    removeUsersSavedEpisodes,
    checkUsersSavedEpisodes,
};