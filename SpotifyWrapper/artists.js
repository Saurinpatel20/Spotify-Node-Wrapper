import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

/**
* Get Spotify catalog information for a single artist identified by their unique Spotify ID.
* @async
* @param {string} accessToken - The access token for authentication with the Spotify API.
* @param {string} artistID - The ID of the artist to retrieve information for.
* @throws {Error} Will throw an error if there's an issue with the API request or response.
* @returns {Promise<object>} A Promise that resolves to the JSON object containing the artist information.
*/
const getArtist = async (accessToken, artistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}artists/${artistID}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information for several artists based on their Spotify IDs.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} listOfArtistID - An array of Spotify IDs representing the artists to retrieve information for.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the artist information.
*/
const getSeveralArtists = async (accessToken, listOfArtistID) => {
    
    if (listOfArtistID.length > 50) {
        return {
            status: "400",
            message: "You have too many artist IDs in your array. Max: 50 Artists.",
        };
    }
    
    if (listOfArtistID.length == 0) {
        return {
            status: "400",
            message: "You passed in no artist IDs in the array.",
        };
    }

    let ids = '?ids=';
    let albums = listOfArtistID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}artists${ids}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information about an artist’s albums. Optional parameters can be specified in the query string to filter and sort the response.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} artistID - The Spotify ID for the artist.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the artist's albums.
*/
const getArtistsAlbums = async (accessToken, artistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}artists/${artistID}/albums`, options);
    return response.json();
}

/**
 * Get Spotify catalog information about an artist’s top tracks by country.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} artistID - The Spotify ID for the artist.
 * @param {string} countryCode - The country: an ISO 3166-1 alpha-2 country code.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the artist's top tracks.
*/
const getArtistTopTracks = async (accessToken, artistID, countryCode) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}artists/${artistID}/top-tracks?market=${countryCode}`, options);
    return response.json();
}

/**
 * Get Spotify catalog information about artists similar to a given artist. Similarity is based on analysis of the Spotify community’s listening history.
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string} artistID - The Spotify ID for the artist.
 * @throws {Error} - Will throw an error if there's an issue with the API request or response.
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the artist's related artists.
*/
const getArtistsRelatedArtists = async (accessToken, artistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}artists/${artistID}/related-artists`, options);
    return response.json();
}

export {
    getArtist,
    getSeveralArtists,
    getArtistsAlbums,
    getArtistTopTracks,
    getArtistsRelatedArtists,
}