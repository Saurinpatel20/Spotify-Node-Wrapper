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

// ---- Internal helpers used to route legacy per-type helpers through the 2026 endpoints ----

const BASE62_22 = /^[0-9A-Za-z]{22}$/;

/**
 * Convert IDs to Spotify URIs. Values that are already URIs are kept.
 * @param {string[]} ids
 * @param {string|((id:string)=>string)} type - e.g. 'track', or a function picking the type per ID.
 * @returns {string[]}
 */
export function toUris(ids, type) {
    return ids.map((id) => (String(id).startsWith('spotify:') ? id : `spotify:${typeof type === 'function' ? type(id) : type}:${id}`));
}

/** Artist IDs are 22-char base62; anything else is treated as a user ID. */
export const artistOrUser = (id) => (BASE62_22.test(id) ? 'artist' : 'user');

/**
 * PUT/DELETE /me/library in chunks of 40. Resolves to `null` on success or Spotify's error JSON.
 * @internal
 */
export async function libraryWrite(method, accessToken, uris) {
    for (let i = 0; i < uris.length; i += MAX_URIS) {
        const part = uris.slice(i, i + MAX_URIS);
        const response = await fetch(`${baseURI}me/library?uris=${encodeURIComponent(part.join(','))}`, {
            method, headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            const text = await response.text();
            try { return JSON.parse(text); } catch { return { error: { status: response.status, message: text } }; }
        }
    }
    return null;
}

/**
 * GET /me/library/contains in chunks of 40 (run in parallel). Resolves to `boolean[]` or Spotify's error JSON.
 * @internal
 */
export async function libraryContains(accessToken, uris) {
    const parts = [];
    for (let i = 0; i < uris.length; i += MAX_URIS) parts.push(uris.slice(i, i + MAX_URIS));
    const results = await Promise.all(parts.map(async (part) => {
        const response = await fetch(`${baseURI}me/library/contains?uris=${encodeURIComponent(part.join(','))}`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return response.json();
    }));
    const err = results.find((r) => !Array.isArray(r));
    return err || results.flat();
}

/**
 * Fetch many single items with bounded concurrency (replacement for removed batch endpoints).
 * @internal
 * @param {string[]} ids
 * @param {(id:string)=>Promise<any>} getOne
 * @param {number} [concurrency]
 */
export async function fetchEach(ids, getOne, concurrency = 5) {
    const out = new Array(ids.length);
    let next = 0;
    const worker = async () => {
        while (next < ids.length) {
            const i = next++;
            const item = await getOne(ids[i]);
            out[i] = item && item.error ? null : item; // the batch endpoints returned null for unknown IDs
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
    return out;
}
