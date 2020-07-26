const express = require('express')
const path = require('path');
const http = require('http')
const bodyparser = require('body-parser')

const userApi = require('./server/routes/user-api');
const tmdbApi = require('./server/routes/tmdb-api');
const app = express()

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/user', userApi);
app.use('/api/tmdb', tmdbApi);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`API running on localhost:${port}`)
})