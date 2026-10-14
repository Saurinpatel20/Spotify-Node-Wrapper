import fetch from './http.js';

const baseURI = "https://api.spotify.com/v1/";
const MAX_URIS = 40;

function validate(uris) {
    if (!Array.isArray(uris) || uris.length === 0) return { status: "400", message: "You passed in no URIs in the array." };
    if (uris.length > MAX_URIS) return { status: "400", message: `You have too many URIs in your array. Max: ${MAX_URIS}.` };
    return null;
}

/**
 * Save items (tracks, albums, episodes, shows, audiobooks) or follow users/playlists, by Spotify URI.
 * Uses `PUT /me/library` (added February 2026; replaces the per-type save/follow endpoints).
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} uris - Up to 40 Spotify URIs, e.g. `spotify:track:...`, `spotify:album:...`, `spotify:playlist:...`.
 * @returns {Promise<object>} Resolves to `{ status: 200, message }` on success, or Spotify's error JSON.
 */
const saveToLibrary = async (accessToken, uris) => {
    const bad = validate(uris); if (bad) return bad;
    const response = await fetch(`${baseURI}me/library?uris=${encodeURIComponent(uris.join(','))}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (response.ok) return { status: response.status, message: "Items saved to library successfully." };
    return response.json();
}

/**
 * Remove items from the library or unfollow users/playlists, by Spotify URI (`DELETE /me/library`).
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} uris - Up to 40 Spotify URIs.
 * @returns {Promise<object>} Resolves to `{ status: 200, message }` on success, or Spotify's error JSON.
 */
const removeFromLibrary = async (accessToken, uris) => {
    const bad = validate(uris); if (bad) return bad;
    const response = await fetch(`${baseURI}me/library?uris=${encodeURIComponent(uris.join(','))}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (response.ok) return { status: response.status, message: "Items removed from library successfully." };
    return response.json();
}

/**
 * Check whether items are saved/followed in the current user's library (`GET /me/library/contains`).
 * @async
 * @param {string} accessToken - The access token for authentication with the Spotify API.
 * @param {string[]} uris - Up to 40 Spotify URIs.
 * @returns {Promise<boolean[]|object>} Resolves to an array of booleans in the same order as `uris`.
 */
const checkLibraryContains = async (accessToken, uris) => {
    const bad = validate(uris); if (bad) return bad;
    const response = await fetch(`${baseURI}me/library/contains?uris=${encodeURIComponent(uris.join(','))}`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
}

export {
    saveToLibrary,
    removeFromLibrary,
    checkLibraryContains,
};
