import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

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
