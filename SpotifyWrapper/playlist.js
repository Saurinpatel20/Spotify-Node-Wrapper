import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getPlaylist = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}`, options);
    return response.json();
}

const changePlaylistDetails = async (accessToken, playlistID, name, isPublic, isCollaborative, description) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            public: isPublic,
            collaborative: isCollaborative,
            description: description,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Playlist details updated successfully.`,
        };
    }
}

const getPlaylistItems = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    return response.json();
}

const updatePlaylistItems = async (accessToken, playlistID, uris, rangeStart, insertBefore, rangeLength, snapshotID) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: uris,
            range_start: rangeStart,
            insert_before: insertBefore,
            range_length: rangeLength,
            snapshot_id: snapshotID,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Playlist items updated successfully.`,
        };
    }
}

const addItemsToPlaylist = async (accessToken, playlistID, uris, position) => {
    if (uris.length === 0 || uris.length > 100) {
        throw new Error("Invalid number of URIs. The URIs array should contain between 1 and 100 elements.");
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: uris,
            position: position,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 201) {
        return {
            status: 201,
            message: `Items added to the playlist successfully.`,
        };
    }
}

const removePlaylistItems = async (accessToken, playlistID, uris, snapshotID) => {
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tracks: uris,
            snapshot_id: snapshotID,
        }),
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/tracks`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: `Items removed from the playlist successfully.`,
        };
    }
}

const getCurrentUserPlaylists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/playlists`, options);
    return response.json();
}

const getUserPlaylists = async (accessToken, userID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}users/${userID}/playlists`, options);
    return response.json();
}

const createPlaylist = async (accessToken, userID, name, isPublic, isCollaborative, description) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            public: isPublic,
            collaborative: isCollaborative,
            description: description,
        }),
    };
    
    const response = await fetch(`${baseURI}users/${userID}/playlists`, options);
    
    if (response.status === 201) {
        return {
            status: 201,
            message: `Playlist created successfully.`,
        };
    }
}

const getFeaturedPlaylists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}browse/featured-playlists`, options);
    return response.json();
}

const getCategoryPlaylists = async (accessToken, categoryID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories/${categoryID}/playlists`, options);
    return response.json();
}

const getPlaylistCoverImage = async (accessToken, playlistID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/images`, options);
    return response.json();
}

const addCustomPlaylistCoverImage = async (accessToken, playlistID, image) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg',
        },
        body: image,
    };
    
    const response = await fetch(`${baseURI}playlists/${playlistID}/images`, options);
    
    if (response.status === 202) {
        return {
            status: 202,
            message: `Custom playlist cover image added successfully.`,
        };
    }
}

export {
    getPlaylist,
    changePlaylistDetails,
    getPlaylistItems,
    updatePlaylistItems,
    addItemsToPlaylist,
    removePlaylistItems,
    getCurrentUserPlaylists,
    getUserPlaylists,
    createPlaylist,
    getFeaturedPlaylists,
    getCategoryPlaylists,
    getPlaylistCoverImage,
    addCustomPlaylistCoverImage,
};
