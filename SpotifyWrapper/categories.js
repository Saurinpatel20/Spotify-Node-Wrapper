import fetch from 'node-fetch';

const baseURI = "https://api.spotify.com/v1/";

const getSeveralBrowseCategories = async (accessToken) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories`, options);
    return response.json();
}

const getSingleBrowseCategory = async (accessToken, categoryID) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(`${baseURI}browse/categories/${categoryID}`, options);
    return response.json();
}

export {
    getSeveralBrowseCategories,
    getSingleBrowseCategory,
}