import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getEpisode = async (accessToken, episodeID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}episodes/${episodeID}`, options);
    return response.json();
}

const getSeveralEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episode IDs in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}episodes?ids=${ids}`, options);
    return response.json();
}

const getUsersSavedEpisodes = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

const saveEpisodesForCurrentUser = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episodes in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

const removeUsersSavedEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episodes in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    };
    
    const response = await fetch(`${baseURI}me/episodes`, options);
    return response.json();
}

const checkUsersSavedEpisodes = async (accessToken, listOfEpisodeID) => {
    if (listOfEpisodeID.length > 50) {
        return {
            status: "400",
            message: "You have too many episode IDs in your array. Max: 50 Episodes.",
        };
    }
    
    if (listOfEpisodeID.length === 0) {
        return {
            status: "400",
            message: "You passed in no episode IDs in the array.",
        };
    }
    
    const ids = listOfEpisodeID.join(",");
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/episodes/contains?ids=${ids}`, options);
    return response.json();
}

export {
    getEpisode,
    getSeveralEpisodes,
    getUsersSavedEpisodes,
    saveEpisodesForCurrentUser,
    removeUsersSavedEpisodes,
    checkUsersSavedEpisodes,
};