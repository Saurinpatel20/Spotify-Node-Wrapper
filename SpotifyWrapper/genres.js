import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getAvailableGenreSeeds = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}recommendations/available-genre-seeds`, options);
    return response.json();
}

export {
    getAvailableGenreSeeds,
};
