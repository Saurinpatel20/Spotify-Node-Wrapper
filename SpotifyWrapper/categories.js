import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get a list of categories used to tag items in Spotify (on, for example, the Spotify player’s “Browse” tab).
 * @async
 * @param {string} accessToken - The access token for the user to get spotify categories for.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the categories.
 */
const getSeveralBrowseCategories = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories`, options);
    return response.json();
}

/**
 * Get a single category used to tag items in Spotify (on, for example, the Spotify player's "Browse" tab).
 * @async
 * @param {string} accessToken - The access token for the user to get spotify categories for.
 * @param {string} categoryID - The ID of the category to retrieve information for.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the category.
 */
const getSingleBrowseCategory = async (accessToken, categoryID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories/${categoryID}`, options);
    return response.json();
}

export {
    getSeveralBrowseCategories,
    getSingleBrowseCategory,
}