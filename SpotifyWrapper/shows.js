import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get Spotify catalog information for a single show identified by its unique Spotify ID.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} showID - The Spotify ID for the show.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the show information.
 */
const getShow = async (accessToken, showID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}shows/${showID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for several shows based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfShowID - The Spotify IDs for the shows. Maximum: 50 IDs.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the show information.
 */
const getSeveralShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many show IDs in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }

    let ids = '?ids=';
    let albums = listOfShowID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}shows${ids}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information about an show’s episodes. Optional parameters can be used to limit the number of episodes returned.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} showID - The Spotify ID for the show.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the show's episodes information.
 */
const getShowEpisodes = async (accessToken, showID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}shows/${showID}/episodes`, options);
    return response.json();
}

/**
 * Get the current user's saved shows
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the user's saved shows.
 */
const getUsersSavedShows = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/shows`, options);
    return response.json();
}

/**
 * Save one or more shows to the current user's library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfShowID - The Spotify IDs for the shows. Maximum: 50 IDs.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing a status code and message.
 */
const saveShowsForCurrentUser = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfShowID.forEach(show => {
        ids += `${show},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/shows${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The shows were successfully saved.",
        };
    }
}

/**
 * Remove one or more shows from the current user's library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfShowID - The Spotify IDs for the shows. Maximum: 50 IDs.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing a status code and message.
 */
const removeUsersSavedShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfShowID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/shows${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The shows were successfully removed.",
        };
    }
}

/**
 * Check if one or more shows are already saved in the current Spotify user’s library.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfShowID - The Spotify IDs for the shows. Maximum: 50 IDs.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to a JSON object containing a status code and message.
 */
const checkUsersSavedShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfShowID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/shows/contains${ids}`, options);

    return {
        response: await response.json(),
    };
}

export {
    getShow,
    getSeveralShows,
    getShowEpisodes,
    getUsersSavedShows,
    saveShowsForCurrentUser,
    removeUsersSavedShows,
    checkUsersSavedShows,
}