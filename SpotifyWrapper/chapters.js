import fetch from './http.js';
import { toUris, artistOrUser, libraryWrite, libraryContains, fetchEach } from './library.js';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get Spotify catalog information for a single chapter identified by their unique Spotify ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} chapterID - The ID of the chapter to retrieve information for.
 * @throws {Error} Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the chapter information.
 */
const getSingleChapter = async (accessToken, chapterID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}chapters/${chapterID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for several chapters based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfChapterID - An array of Spotify IDs representing the chapters to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the chapter information.
*/
const getSeveralChapters = async (accessToken, listOfChapterID) => {
    if (!Array.isArray(listOfChapterID) || listOfChapterID.length === 0) {
        return { status: "400", message: "You passed in no chapter IDs in the array." };
    }
    // The batch endpoint was removed (Feb 2026); fetch each chapter individually (5 at a time).
    return { chapters: await fetchEach(listOfChapterID, (id) => getSingleChapter(accessToken, id)) };
}

export {
    getSingleChapter,
    getSeveralChapters,
};