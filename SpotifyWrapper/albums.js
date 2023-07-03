import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getAlbum = async (accessToken, albumID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}albums/${albumID}`, options);
    return response.json();
}

const getSeveralAlbums = async (accessToken, listOfAlbumID) => {
    
    if (listOfAlbumID.length > 20) {
        return {
            status: "400",
            message: "You have too many album IDs in your array. Max: 20 Albums.",
        };
    }
    
    if (listOfAlbumID.length == 0) {
        return {
            status: "400",
            message: "You passed in no album IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfAlbumID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}albums${ids}`, options);
    return response.json();
}

const getAlbumTracks = async (accessToken, albumID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}albums/${albumID}/tracks`, options);
    return response.json();
}

const getUsersSavedAlbums = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/albums`, options);
    return response.json();
}

const saveAlbumsForCurrentUser = async (accessToken, listOfAlbumID) => {
    
    if (listOfAlbumID.length > 20) {
        return {
            status: "400",
            message: "You have too many albums in your array. Max: 20 Albums.",
        };
    }
    
    if (listOfAlbumID.length == 0) {
        return {
            status: "400",
            message: "You passed in no album IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfAlbumID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/albums${ids}`, options);
    
    if (response.status == 200) {
        return {
            status: 200,
            message: "The albums were successfully saved.",
        };
    }
}

const removeUsersSavedAlbums = async (accessToken, listOfAlbumID) => {
    
    if (listOfAlbumID.length > 20) {
        return {
            status: "400",
            message: "You have too many albums in your array. Max: 20 Albums.",
        };
    }
    
    if (listOfAlbumID.length == 0) {
        return {
            status: "400",
            message: "You passed in no album IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfAlbumID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/albums${ids}`, options);
    
    if (response.status == 200) {
        return {
            status: 200,
            message: "The albums were successfully removed.",
        };
    }
}

const checkUsersSavedAlbums = async (accessToken, listOfAlbumID) => {
    
    if (listOfAlbumID.length > 20) {
        return {
            status: "400",
            message: "You have too many albums in your array. Max: 20 Albums.",
        };
    }
    
    if (listOfAlbumID.length == 0) {
        return {
            status: "400",
            message: "You passed in no album IDs in the array.",
        };
    }

    let ids = '?ids=';
    let albums = listOfAlbumID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/albums/contains${ids}`, options);
    return response.json()
}

const getNewReleases = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}browse/new-releases`, options);
    return response.json();
}

export {
    getAlbum,
    getSeveralAlbums,
    getAlbumTracks,
    getUsersSavedAlbums,
    saveAlbumsForCurrentUser,
    removeUsersSavedAlbums,
    checkUsersSavedAlbums,
    getNewReleases,
}