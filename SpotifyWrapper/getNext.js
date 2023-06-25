import { json } from "express";
import fetch from 'node-fetch';
import querystring from 'querystring';

const baseURI = "https://api.spotify.com/v1/";

export const getNext = async (accessToken, nextURL) => {
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

