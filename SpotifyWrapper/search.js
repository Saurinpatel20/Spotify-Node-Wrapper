import fetch from './http.js';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Search Spotify for an item.
 * @async
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {string} query - The search query.
 * @param {string[]} types - The types of items to search for.
 * @param {{market?:string, limit?:number, offset?:number, include_external?:'audio'}} [searchOptions] - Optional parameters (limit max 10 since Feb 2026).
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the search results.
 */
const searchForItem = async (accessToken, query, types, searchOptions = {}) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const searchQuery = encodeURIComponent(query);
    const searchTypes = types.join(',');

    const response = await fetch(`${baseURI}search?q=${searchQuery}&type=${searchTypes}${Object.entries(searchOptions).filter(([, v]) => v != null).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('')}`, options);
    return response.json();
};

export {
    searchForItem,
};