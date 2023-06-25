import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getShow = async (accessToken, showID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}shows/${showID}`, options);
    return response.json();
}

const getSeveralShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many show IDs in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfShowID.forEach(show => {
        ids += `${show},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}shows${ids}`, options);
    return response.json();
}

const getShowEpisodes = async (accessToken, showID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}shows/${showID}/episodes`, options);
    return response.json();
}

const getUsersSavedShows = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/shows`, options);
    return response.json();
}

const saveShowsForCurrentUser = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfShowID.forEach(show => {
        ids += `${show},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/shows${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The shows were successfully saved.",
        };
    }
}

const removeUsersSavedShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfShowID.forEach(show => {
        ids += `${show},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/shows${ids}`, options);
    
    if (response.status === 200) {
        return {
            status: 200,
            message: "The shows were successfully removed.",
        };
    }
}

const checkUsersSavedShows = async (accessToken, listOfShowID) => {
    if (listOfShowID.length > 50) {
        return {
            status: "400",
            message: "You have too many shows in your array. Max: 50 Shows.",
        };
    }
    
    if (listOfShowID.length === 0) {
        return {
            status: "400",
            message: "You passed in no show IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfShowID.forEach(show => {
        ids += `${show},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/shows/contains${ids}`, options);

    return {
        response: await response.json(),
    };
}

export {
    getShow,
    getSeveralShows,
    getShowEpisodes,
    getUsersSavedShows,
    saveShowsForCurrentUser,
    removeUsersSavedShows,
    checkUsersSavedShows,
}