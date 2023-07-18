import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get a list of available markets for tracks.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the available markets.
 */
const getAvailableMarkets = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}markets`, options);
    return response.json();
}

export {
    getAvailableMarkets,
};
