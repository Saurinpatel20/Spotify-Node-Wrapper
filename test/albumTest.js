import assert from 'assert';
import { getSpotifyAccessToken, getAlbum } from '../index.js';

import dotenv from 'dotenv';
dotenv.config();

var accessToken;

describe('getSpotifyAccessToken', function() {
    it('should return an access token', async function() {
        accessToken = await getSpotifyAccessToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        console.log(accessToken);
        assert(accessToken);
    });
});

// Used the Optimist Album by JUNNY as a test case
describe('getAlbum', function() {
    it('should return the correct album', async function() {
        // Mock the API response
        const mockResponse = {"album_type":"single","artists":[{"external_urls":{"spotify":"https://open.spotify.com/artist/0lgENJQUkqkDbpsTYEayOr"},"href":"https://api.spotify.com/v1/artists/0lgENJQUkqkDbpsTYEayOr","id":"0lgENJQUkqkDbpsTYEayOr","name":"JUNNY","type":"artist","uri":"spotify:artist:0lgENJQUkqkDbpsTYEayOr"}],"available_markets":["AR","AU","AT","BE","BO","BR","BG","CA","CL","CO","CR","CY","CZ","DK","DO","DE","EC","EE","SV","FI","FR","GR","GT","HN","HK","HU","IS","IE","IT","LV","LT","LU","MY","MT","MX","NL","NZ","NI","NO","PA","PY","PE","PH","PL","PT","SG","SK","ES","SE","CH","TW","TR","UY","US","GB","AD","LI","MC","ID","JP","TH","VN","RO","IL","ZA","SA","AE","BH","QA","OM","KW","EG","MA","DZ","TN","LB","JO","PS","IN","BY","KZ","MD","UA","AL","BA","HR","ME","MK","RS","SI","KR","BD","PK","LK","GH","KE","NG","TZ","UG","AG","AM","BS","BB","BZ","BT","BW","BF","CV","CW","DM","FJ","GM","GE","GD","GW","GY","HT","JM","KI","LS","LR","MW","MV","ML","MH","FM","NA","NR","NE","PW","PG","WS","SM","ST","SN","SC","SL","SB","KN","LC","VC","SR","TL","TO","TT","TV","VU","AZ","BN","BI","KH","CM","TD","KM","GQ","SZ","GA","GN","KG","LA","MO","MR","MN","NP","RW","TG","UZ","ZW","BJ","MG","MU","MZ","AO","CI","DJ","ZM","CD","CG","IQ","LY","TJ","VE","ET","XK"],"copyrights":[{"text":"2023 mauve company,under license to Kakao Entertainment","type":"C"},{"text":"2023 mauve company,under license to Kakao Entertainment","type":"P"}],"external_ids":{"upc":"8804775267468"},"external_urls":{"spotify":"https://open.spotify.com/album/7ErFctcmAOQiP6xNktc5lX"},"genres":[],"href":"https://api.spotify.com/v1/albums/7ErFctcmAOQiP6xNktc5lX","id":"7ErFctcmAOQiP6xNktc5lX","images":[{"height":640,"url":"https://i.scdn.co/image/ab67616d0000b273138635a076d69f63fff186c6","width":640},{"height":300,"url":"https://i.scdn.co/image/ab67616d00001e02138635a076d69f63fff186c6","width":300},{"height":64,"url":"https://i.scdn.co/image/ab67616d00004851138635a076d69f63fff186c6","width":64}],"label":"mauve company","name":"Optimist (Feat. Blase)","popularity":38,"release_date":"2023-03-13","release_date_precision":"day","total_tracks":1,"tracks":{"href":"https://api.spotify.com/v1/albums/7ErFctcmAOQiP6xNktc5lX/tracks?offset=0&limit=50","items":[{"artists":[{"external_urls":{"spotify":"https://open.spotify.com/artist/0lgENJQUkqkDbpsTYEayOr"},"href":"https://api.spotify.com/v1/artists/0lgENJQUkqkDbpsTYEayOr","id":"0lgENJQUkqkDbpsTYEayOr","name":"JUNNY","type":"artist","uri":"spotify:artist:0lgENJQUkqkDbpsTYEayOr"},{"external_urls":{"spotify":"https://open.spotify.com/artist/6XsOOgLCtnkkOv2uhZXuB0"},"href":"https://api.spotify.com/v1/artists/6XsOOgLCtnkkOv2uhZXuB0","id":"6XsOOgLCtnkkOv2uhZXuB0","name":"BLASÉ","type":"artist","uri":"spotify:artist:6XsOOgLCtnkkOv2uhZXuB0"}],"available_markets":["AR","AU","AT","BE","BO","BR","BG","CA","CL","CO","CR","CY","CZ","DK","DO","DE","EC","EE","SV","FI","FR","GR","GT","HN","HK","HU","IS","IE","IT","LV","LT","LU","MY","MT","MX","NL","NZ","NI","NO","PA","PY","PE","PH","PL","PT","SG","SK","ES","SE","CH","TW","TR","UY","US","GB","AD","LI","MC","ID","JP","TH","VN","RO","IL","ZA","SA","AE","BH","QA","OM","KW","EG","MA","DZ","TN","LB","JO","PS","IN","BY","KZ","MD","UA","AL","BA","HR","ME","MK","RS","SI","KR","BD","PK","LK","GH","KE","NG","TZ","UG","AG","AM","BS","BB","BZ","BT","BW","BF","CV","CW","DM","FJ","GM","GE","GD","GW","GY","HT","JM","KI","LS","LR","MW","MV","ML","MH","FM","NA","NR","NE","PW","PG","WS","SM","ST","SN","SC","SL","SB","KN","LC","VC","SR","TL","TO","TT","TV","VU","AZ","BN","BI","KH","CM","TD","KM","GQ","SZ","GA","GN","KG","LA","MO","MR","MN","NP","RW","TG","UZ","ZW","BJ","MG","MU","MZ","AO","CI","DJ","ZM","CD","CG","IQ","LY","TJ","VE","ET","XK"],"disc_number":1,"duration_ms":164919,"explicit":false,"external_urls":{"spotify":"https://open.spotify.com/track/0XoTRbjmqOw5Wx7b2aw9Ud"},"href":"https://api.spotify.com/v1/tracks/0XoTRbjmqOw5Wx7b2aw9Ud","id":"0XoTRbjmqOw5Wx7b2aw9Ud","is_local":false,"name":"Optimist (Feat. Blase)","preview_url":"https://p.scdn.co/mp3-preview/6bc544b233fb6c1d0cd43f69170c082c73a7d14c?cid=e512ac558e3745b291a81173d053c719","track_number":1,"type":"track","uri":"spotify:track:0XoTRbjmqOw5Wx7b2aw9Ud"}],"limit":50,"next":null,"offset":0,"previous":null,"total":1},"type":"album","uri":"spotify:album:7ErFctcmAOQiP6xNktc5lX"};
        global.fetch = () => Promise.resolve({
            json: () => Promise.resolve(mockResponse),
        });

        const album = await getAlbum(accessToken, '7ErFctcmAOQiP6xNktc5lX');
        assert.deepStrictEqual(album, mockResponse);
    });
});
