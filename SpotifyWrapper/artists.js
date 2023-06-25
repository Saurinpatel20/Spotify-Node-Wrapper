import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

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
    listOfArtistID.map(async (album) => {
        ids += `${album},`;
    })
    
    ids = ids.slice(0, -1);
    
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