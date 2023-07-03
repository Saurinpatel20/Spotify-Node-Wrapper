import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getAudiobook = async (accessToken, audiobookID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}artists/${audiobookID}`, options);
    return response.json();
}

const getSeveralAudiobooks = async (accessToken, listOfAudiobookID) => {
    
    if (listOfAudiobookID.length > 50) {
        return {
            status: "400",
            message: "You have too many audiobook IDs in your array. Max: 50 Audiobooks.",
        };
    }
    
    if (listOfAudiobookID.length == 0) {
        return {
            status: "400",
            message: "You passed in no audiobook IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfAudiobookID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}audiobooks${ids}`, options);
    return response.json();
}

const getAudiobookChapters = async (accessToken, audiobookID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    const response = await fetch(`${baseURI}audiobook/${audiobookID}/chapters`, options);
    return response.json();
}

const getUsersSavedAudiobooks = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };
    
    const response = await fetch(`${baseURI}me/audiobooks`, options);
    return response.json();
}

const saveAudiobooksForCurrentUser = async (accessToken, listOfAudiobookID) => {
    
    if (listOfAudiobookID.length > 50) {
        return {
            status: "400",
            message: "You have too many audiobooks in your array. Max: 50 audiobooks.",
        };
    }
    
    if (listOfAudiobookID.length == 0) {
        return {
            status: "400",
            message: "You passed in no audiobook IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    let albums = listOfAudiobookID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/audiobooks${ids}`, options);
    
    if (response.status == 200) {
        return {
            status: 200,
            message: "The audiobooks were successfully saved.",
        };
    }
}

const removeUsersSavedAudiobooks = async (accessToken, listOfAudiobookID) => {
    
    if (listOfAudiobookID.length > 50) {
        return {
            status: "400",
            message: "You have too many audiobooks in your array. Max: 50 audiobooks.",
        };
    }
    
    if (listOfAudiobookID.length == 0) {
        return {
            status: "400",
            message: "You passed in no audiobook IDs in the array.",
        };
    }

    let ids = '?ids=';
    let albums = listOfAudiobookID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };
    
    const response = await fetch(`${baseURI}me/audiobooks${ids}`, options);
    
    if (response.status == 200) {
        return {
            status: 200,
            message: "The audiobooks were successfully removed.",
        };
    }
}

const checkUsersSavedAudiobooks = async (accessToken, listOfAudiobookID) => {
    
    if (listOfAudiobookID.length > 50) {
        return {
            status: "400",
            message: "You have too many audiobooks in your array. Max: 50 Audiobooks.",
        };
    }
    
    if (listOfAudiobookID.length == 0) {
        return {
            status: "400",
            message: "You passed in no audiobook IDs in the array.",
        };
    }

    let ids = '?ids=';
    let albums = listOfAudiobookID.join(',');
    ids += `${albums}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}me/audiobooks/contains${ids}`, options);

    return {
        response: await response.json(),
    };
}

export {
    getAudiobook,
    getSeveralAudiobooks,
    getAudiobookChapters,
    getUsersSavedAudiobooks,
    saveAudiobooksForCurrentUser,
    removeUsersSavedAudiobooks,
    checkUsersSavedAudiobooks,
} 