import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getTrack = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}tracks/${trackID}`, options);
    return response.json();
}

const getSeveralTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many track IDs in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfTrackID.forEach(track => {
        ids += `${track},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}tracks${ids}`, options);
    return response.json();
}

const getUsersSavedTracks = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks`, options);
    return response.json();
}

const saveTracksForCurrentUser = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfTrackID.forEach(track => {
        ids += `${track},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The tracks were successfully saved.",
        };
    }
}

const removeUsersSavedTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfTrackID.forEach(track => {
        ids += `${track},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The tracks were successfully removed.",
        };
    }
}

const checkUsersSavedTracks = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 50) {
        return {
            status: "400",
            message: "You have too many tracks in your array. Max: 50 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfTrackID.forEach(track => {
        ids += `${track},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/tracks/contains${ids}`, options);

    return {
        response: await response.json(),
    };
}

const getTracksAudioFeatures = async (accessToken, listOfTrackID) => {
    if (listOfTrackID.length > 100) {
        return {
            status: "400",
            message: "You have too many track IDs in your array. Max: 100 Tracks.",
        };
    }
    
    if (listOfTrackID.length === 0) {
        return {
            status: "400",
            message: "You passed in no track IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfTrackID.forEach(track => {
        ids += `${track},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}audio-features${ids}`, options);
    return response.json();
}

const getTrackAudioFeatures = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}audio-features/${trackID}`, options);
    return response.json();
}

const getTrackAudioAnalysis = async (accessToken, trackID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}audio-analysis/${trackID}`, options);
    return response.json();
}

const getRecommendations = async (accessToken, queryParams) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    let queryString = '?';
    
    for (const key in queryParams) {
        if (Object.hasOwnProperty.call(queryParams, key)) {
            queryString += `${key}=${queryParams[key]}&`;
        }
    }
    
    queryString = queryString.slice(0, -1);
    
    const response = await fetch(`${baseURI}recommendations${queryString}`, options);
    return response.json();
}

export {
    getTrack,
    getSeveralTracks,
    getUsersSavedTracks,
    saveTracksForCurrentUser,
    removeUsersSavedTracks,
    checkUsersSavedTracks,
    getTracksAudioFeatures,
    getTrackAudioFeatures,
    getTrackAudioAnalysis,
    getRecommendations,
};
