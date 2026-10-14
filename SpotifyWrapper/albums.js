import fetch from './http.js';
import { toUris, artistOrUser, libraryWrite, libraryContains, fetchEach } from './library.js';

const baseURI = "https://api.spotify.com/v1/";

/**
* Get Spotify catalog information for a single album.
* @async
* @param {string} accessToken - The access token for authentication with the Spotify API.
* @param {string} albumID - The ID of the album to retrieve information for.
* @throws {Error} Will throw an error if there's an issue with the API request or response.
* @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
*/
const getAlbum = async (accessToken, albumID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}albums/${albumID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAlbumID - An array of Spotify IDs representing the albums to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
*/
const getSeveralAlbums = async (accessToken, listOfAlbumID) => {
    if (!Array.isArray(listOfAlbumID) || listOfAlbumID.length === 0) {
        return { status: "400", message: "You passed in no album IDs in the array." };
    }
    // The batch endpoint was removed (Feb 2026); fetch each item individually (5 at a time).
    return { albums: await fetchEach(listOfAlbumID, (id) => getAlbum(accessToken, id)) };
}

/**
 * Get Spotify catalog information about an album’s tracks.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} albumID - An album ID representing the album to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const getAlbumTracks = async (accessToken, albumID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}albums/${albumID}/tracks`, options);
    return response.json();
}

/**
 * Get a list of the albums saved in the current Spotify user’s ‘Your Music’ library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const getUsersSavedAlbums = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/albums`, options);
    return response.json();
}

/**
 * Save one or more albums to the current user’s ‘Your Music’ library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAlbumID - An array of Spotify IDs representing the albums to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const saveAlbumsForCurrentUser = async (accessToken, listOfAlbumID) => {
    if (!Array.isArray(listOfAlbumID) || listOfAlbumID.length === 0) {
        return { status: "400", message: "You passed in no album IDs in the array." };
    }
    // Routed through PUT /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('PUT', accessToken, toUris(listOfAlbumID, 'album'));
    if (error) return error;
    return { status: 200, message: "The albums were successfully saved." };
}

/**
 * Remove one or more albums from the current user’s ‘Your Music’ library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAlbumID - An array of Spotify IDs representing the albums to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const removeUsersSavedAlbums = async (accessToken, listOfAlbumID) => {
    if (!Array.isArray(listOfAlbumID) || listOfAlbumID.length === 0) {
        return { status: "400", message: "You passed in no album IDs in the array." };
    }
    // Routed through DELETE /me/library (Feb 2026); chunked by 40 URIs.
    const error = await libraryWrite('DELETE', accessToken, toUris(listOfAlbumID, 'album'));
    if (error) return error;
    return { status: 200, message: "The albums were successfully removed." };
}

/**
 * Check if one or more albums is already saved in the current Spotify user’s ‘Your Music’ library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfAlbumID - An array of Spotify IDs representing the albums to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const checkUsersSavedAlbums = async (accessToken, listOfAlbumID) => {
    if (!Array.isArray(listOfAlbumID) || listOfAlbumID.length === 0) {
        return { status: "400", message: "You passed in no album IDs in the array." };
    }
    // Routed through GET /me/library/contains (Feb 2026); returns boolean[] in input order.
    return libraryContains(accessToken, toUris(listOfAlbumID, 'album'));
}

/**
 * Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API. 
 * @throws {Error} - Will throw an error if there's an issue with the API request or response. 
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the album information.
 */
const getNewReleases = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}browse/new-releases`, options);
    return response.json();
}

export {
    getAlbum,
    getSeveralAlbums,
    getAlbumTracks,
    getUsersSavedAlbums,
    saveAlbumsForCurrentUser,
    removeUsersSavedAlbums,
    checkUsersSavedAlbums,
    getNewReleases,
}