import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getCurrentUserProfile = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `'Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me`, options);
    return response.json();
}

const getUsersTopItems = async (accessToken, type) => {
    const validTypes = ['artists', 'tracks'];
    if (!validTypes.includes(type)) {
        return {
            status: "400",
            message: "Invalid type. Allowed values: 'artists', 'tracks'.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me/top/${type}`, options);
    return response.json();
}

const getUserProfile = async (accessToken, userId) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}users/${userId}`, options);
    return response.json();
}

const followPlaylist = async (accessToken, playlistId, isPublic = true) => {
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            public: isPublic
        })
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers`, options);

    if (response.status == 200) {
        return {
            status: 200,
            message: "Successfully followed the playlist.",
        };
    }
}

const unfollowPlaylist = async (accessToken, playlistId) => {
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers`, options);

    if (response.status == 200) {
        return {
            status: 200,
            message: "Successfully unfollowed the playlist.",
        };
    }
}

const getFollowedArtists = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}me/following`, options);
    return response.json();
}

const followArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}me/following?type=artist,user&ids=${ids.join(',')}`, options);

    if (response.status == 204) {
        return {
            status: 204,
            message: "Successfully followed artists or users.",
        };
    }
}

const unfollowArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const response = await fetch(`${baseURI}me/following?type=artist,user&ids=${ids.join(',')}`, options);

    if (response.status == 204) {
        return {
            status: 204,
            message: "Successfully unfollowed artists or users.",
        };
    }
}

const checkUserFollowsArtistsOrUsers = async (accessToken, ids) => {
    if (ids.length === 0 || ids.length > 50) {
        return {
            status: "400",
            message: "Invalid number of ids. The number of ids must be between 0 and 50.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${baseURI}me/following/contains?type=artist,user&ids=${ids.join(',')}`, options);

    return {
        response: await response.json(),
    };
}

const checkUsersFollowPlaylist = async (accessToken, playlistId, userIds) => {
    if (userIds.length === 0 || userIds.length > 5) {
        return {
            status: "400",
            message: "Invalid number of user ids. The number of ids must be between 0 and 5.",
        };
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${baseURI}playlists/${playlistId}/followers/contains?ids=${userIds.join(',')}`, options);

    return {
        response: await response.json(),
    };
}

export {
    getCurrentUserProfile,
    getUsersTopItems,
    getUserProfile,
    followPlaylist,
    unfollowPlaylist,
    getFollowedArtists,
    followArtistsOrUsers,
    unfollowArtistsOrUsers,
    checkUserFollowsArtistsOrUsers,
    checkUsersFollowPlaylist,
}
