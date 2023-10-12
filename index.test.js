import { getSpotifyAccessToken } from './index.js';

// Update these with proper client values for the test suite to run
var accessToken = getSpotifyAccessToken('clientId', 'clientSecret', 'redirectUri');

import { getAlbum } from './index.js';
describe('getAlbum', () => {
    test('returns the correct album', async () => {
        // Mock the API response
        const mockResponse = { /* ... */ };
        jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
            json: () => Promise.resolve(mockResponse),
        }));

        const album = await getAlbum(accessToken, 'someAlbumId');

        expect(album).toEqual(mockResponse);

        // Clean up the fetch mock
        global.fetch.mockRestore();
    });
});
