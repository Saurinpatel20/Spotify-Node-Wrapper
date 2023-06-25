import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getSingleChapter = async (accessToken, chapterID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}chapters/${chapterID}`, options);
    return response.json();
}

const getSeveralChapters = async (accessToken, listOfChapterID) => {
    if (listOfChapterID.length > 50) {
        return {
            status: "400",
            message: "You have too many chapter IDs in your array. Max: 50 Chapters.",
        };
    }
    
    if (listOfChapterID.length === 0) {
        return {
            status: "400",
            message: "You passed in no chapter IDs in the array.",
        };
    }
    
    let ids = '?ids=';
    listOfChapterID.forEach((chapter) => {
        ids += `${chapter},`;
    });
    
    ids = ids.slice(0, -1);
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}chapters${ids}`, options);
    return response.json();
}

export {
    getSingleChapter,
    getSeveralChapters,
};