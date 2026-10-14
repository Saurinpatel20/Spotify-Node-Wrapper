import fetch from './http.js';
import { toUris, artistOrUser, libraryWrite, libraryContains, fetchEach } from './library.js';

const baseURI = "https://api.spotify.com/v1/";

/**
* Get Spotify catalog information for a single audiobook identified by their unique Spotify ID.
* @async
* @param {string} accessToken - The access token for authentication with the Spotify API.
* @param {string} audiobookID - The ID of the audiobook to retrieve information for.
* @throws {Error} Will throw an error if there's an issue with the API request or response.
* @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook information.
*/
const getAudiobook = async (accessToken, audiobookID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}audiobooks/${audiobookID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for several audiobooks based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAudiobookID - An array of Spotify IDs representing the audiobooks to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook information.
*/
const getSeveralAudiobooks = async (accessToken, listOfAudiobookID) => {
    if (!Array.isArray(listOfAudiobookID) || listOfAudiobookID.length === 0) {
        return { status: "400", message: "You passed in no audiobook IDs in the array." };
    }
    // The batch endpoint was removed (Feb 2026); fetch each item individually (5 at a time).
    return { audiobooks: await fetchEach(listOfAudiobookID, (id) => getAudiobook(accessToken, id)) };
}

/**
 * Get Spotify catalog information about an audiobook’s tracks.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} audiobookID - The ID of the audiobook to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook chapter information.
*/
const getAudiobookChapters = async (accessToken, audiobookID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}audiobooks/${audiobookID}/chapters`, options);
    return response.json();
}

/**
 * Get spotify catalog information about a user's saved audiobooks.
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's saved audiobooks.
 */
const getUsersSavedAudiobooks = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/audiobooks`, options);
    return response.json();
}

/**
 * Save one or more audiobooks to the current user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAudiobookID - An array of Spotify IDs representing the audiobooks to save.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook information.
 */
const saveAudiobooksForCurrentUser = async (accessToken, listOfAudiobookID) => {
    if (!Array.isArray(listOfAudiobookID) || listOfAudiobookID.length === 0) {
        return { status: "400", message: "You passed in no audiobook IDs in the array." };
    }
    // Routed through PUT /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('PUT', accessToken, toUris(listOfAudiobookID, 'audiobook'));
    if (error) return error;
    return { status: 200, message: "The audiobooks were successfully saved." };
}

/**
 * Remove one or more audiobooks from the current user's Spotify library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAudiobookID - An array of Spotify IDs representing the audiobooks to remove.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook information.
 */
const removeUsersSavedAudiobooks = async (accessToken, listOfAudiobookID) => {
    if (!Array.isArray(listOfAudiobookID) || listOfAudiobookID.length === 0) {
        return { status: "400", message: "You passed in no audiobook IDs in the array." };
    }
    // Routed through DELETE /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('DELETE', accessToken, toUris(listOfAudiobookID, 'audiobook'));
    if (error) return error;
    return { status: 200, message: "The audiobooks were successfully removed." };
}

/**
 * Check if one or more audiobooks is already saved in the current Spotify user’s ‘Your Music’ library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAudiobookID - An array of Spotify IDs representing the audiobooks to check.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the audiobook information.
 */
const checkUsersSavedAudiobooks = async (accessToken, listOfAudiobookID) => {
    if (!Array.isArray(listOfAudiobookID) || listOfAudiobookID.length === 0) {
        return { status: "400", message: "You passed in no audiobook IDs in the array." };
    }
    // Routed through GET /me/library/contains (Feb 2026); returns boolean[] in input order.
    return libraryContains(accessToken, toUris(listOfAudiobookID, 'audiobook'));
}

export {
    getAudiobook,
    getSeveralAudiobooks,
    getAudiobookChapters,
    getUsersSavedAudiobooks,
    saveAudiobooksForCurrentUser,
    removeUsersSavedAudiobooks,
    checkUsersSavedAudiobooks,
} 