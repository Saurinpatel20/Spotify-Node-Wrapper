import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

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