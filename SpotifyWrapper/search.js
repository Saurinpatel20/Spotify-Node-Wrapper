import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Search Spotify for an item.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {string} query - The search query.
 * @param {string[]} types - The types of items to search for.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the search results.
 */
const searchForItem = async (accessToken, query, types) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const searchQuery = encodeURIComponent(query);
    const searchTypes = types.join(',');

    const response = await fetch(`${baseURI}search?q=${searchQuery}&type=${searchTypes}`, options);
    return response.json();
};

export {
    searchForItem,
};