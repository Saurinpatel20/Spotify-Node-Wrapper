import { getAlbum } from './index.js';

describe('getAlbum', () => {
    test('returns the correct album', async () => {
        // Mock the API response
        const mockResponse = { /* ... */ };
        jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
            json: () => Promise.resolve(mockResponse),
        }));

        const album = await getAlbum('someAlbumId');

        expect(album).toEqual(mockResponse);

        // Clean up the fetch mock
        global.fetch.mockRestore();
    });
});
