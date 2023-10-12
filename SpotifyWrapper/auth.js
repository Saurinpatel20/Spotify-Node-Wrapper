import fetch from 'node-fetch';

async function getSpotifyAccessToken(clientId, clientSecret, redirectUri) {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'redirect_uri': redirectUri
        })
    });

    const data = await response.json();
    return data.access_token;
}

export {
    getSpotifyAccessToken,
};
