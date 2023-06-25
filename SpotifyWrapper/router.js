// do express routing here for all endpoints.

const album = require('albums.js');

const baseURI = 'https://api.spotify.com/v1';

import express from 'express';

const app = express();

app.get('/getAlbum', (req, res) => {
    console.log(album.getAlbum(req.body.accessToken, req.body.albumID));
});

app.get('/getPlaylist', (req, res) => {
    console.log(album.getPlaylist(req.body.accessToken, req.body.albumID));
});

