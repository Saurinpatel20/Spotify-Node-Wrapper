import { json } from "express";
import fetch from 'node-fetch';
import querystring from 'querystring';

const baseURI = "https://api.spotify.com/v1/";

/**
 * Get the next item from the Spotify API using the next URL parameter
 * @async 
 * @param {string} accessToken - The access token for the user to be authenticated with the Spotify API.
 * @param {string} nextURL - The next URL to fetch the next item from the Spotify API
 * @returns {Promise<object>} A Promise that resolves to the JSON object containing the next page of results.
 */
const getNext = async (accessToken, nextURL) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(nextURL, options);
    return response.json();
}

export {
    getNext,
}