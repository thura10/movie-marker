const express = require('express');
const router = express.Router();

const axios = require('axios');

const API_KEY = process.env.TMDB_API;
const base_url = "https://api.themoviedb.org/3";

router.get('/search/:query', (req, res) => {
    let str = addPathToUrl(base_url, ["search", "multi"])
    let params = setParams({"query": req.params.query}).toString()

    let url = `${str}?${params}`

    axios.get(url)
    .then(result => {
        res.status(200).json(result.data.results);
    })
    .catch(error => {
        res.status(500).send(error)
    });
});
router.get('/movie/:id', (req, res) => {
    let str = addPathToUrl(base_url, ["movie", req.params.id]);
    let params = setParams({"append_to_response": "credits,videos,similar,recommendations,images", "include_image_language": "en,null"}).toString();

    let url = `${str}?${params}`

    axios.get(url)
    .then(result => {
        res.status(200).json(result.data)
    })
    .catch(error => {
        res.status(500).send(error)
    })
})
router.get('/collection/:id', (req, res) => {
    let str= addPathToUrl(base_url, ["collection", req.params.id]);
    let params = setParams({}).toString();

    let url = `${str}?${params}`;
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data)
    })
    .catch(error => {
        res.status(500).send(error)
    })
})

router.get('/tv/:id', (req, res) => {
    let str = addPathToUrl(base_url, ["tv", req.params.id]);
    let params = setParams({"append_to_response": "credits,similar,recommendations", "include_image_language": "en,null"}).toString();

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data)
    })
    .catch(error => {
        res.status(500).send(error)
    })
})

router.get('/tv/:tvId/season/:seasonNumber', (req, res) => {
    let str = addPathToUrl(base_url, ["tv", req.params.tvId, 'season', req.params.seasonNumber]);
    let params = setParams({}).toString();

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data)
    })
    .catch(error => {
        res.status(500).send(error)
    })
})

router.get('/actor/:id', (req, res) => {
    let str = addPathToUrl(base_url, ["person", req.params.id]);
    let params = setParams({"append_to_response": "combined_credits"}).toString();

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data);
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.get('/genre/:type/:id/:page', (req, res) => {
    let str = addPathToUrl(base_url, ["discover", req.params.type]);
    let params = setParams({"sort_by": "popularity.desc", "with_genres": req.params.id, "page": req.params.page});

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data);
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.get('/genres/:type/list/', (req, res) => {
    let str = addPathToUrl(base_url, ["genre", req.params.type, "list"]);
    let params = setParams({}).toString();

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        res.status(200).json(result.data);
    })
    .catch(err => {
        res.status(500).send(err);
    })
})

router.get('/calendar/tv/:startDate/:endDate', (req, res) => {
    let str = addPathToUrl(base_url, ['discover', 'tv']);
    let params = setParams({"sort_by": "popularity.desc", "air_date.gte": req.params.startDate, "air_date.lte": req.params.endDate}).toString();

    let url = `${str}?${params}`
    axios.get(url)
    .then(result => {
        let promises = [];
        for (tv of result.data.results) {
            let str = addPathToUrl(base_url, ['tv', tv.id]);
            let params = setParams({}).toString();
            let url = `${str}?${params}`

            promises.push(axios.get(url))
        }
        Promise.all(promises)
        .then((result2) => {
            res.status(200).send(result2.map((item) => item.data));
        })
        .catch(err => {
            res.status(200).send([err]);
        })
    })
    .catch(err => {
        res.status(500).send(err);
    })
})

router.route('/discover/popular/movie/:page').get((req, res) => {
    let str = addPathToUrl(base_url, ['movie', 'popular']);
    let params = setParams({page: req.params.page}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        res.status(200).send(result.data)
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.route('/discover/popular/tv/:page').get((req, res) => {
    let str = addPathToUrl(base_url, ['tv', 'popular']);
    let params = setParams({page: req.params.page}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        res.status(200).send(result.data)
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.route('/discover/trending/movie/:page').get((req, res) => {
    let str = addPathToUrl(base_url, ['trending', 'movie', 'week']);
    let params = setParams({page: req.params.page}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        res.status(200).send(result.data)
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.route('/discover/trending/tv/:page').get((req, res) => {
    let str = addPathToUrl(base_url, ['trending', 'tv', 'week']);
    let params = setParams({page: req.params.page}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        res.status(200).send(result.data)
    })
    .catch(err => {
        res.status(500).send(err);
    })
})
router.route('/discover/poster').get((req, res) => {
    let str = addPathToUrl(base_url, ['movie', 'latest']);
    let params = setParams({}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        let latestId = result.data.id;
        let id = Math.floor(Math.random() * Math.floor(latestId));

        let posterStr = addPathToUrl(base_url, ['movie', id])
        axios.get(`${posterStr}?${params}`)
        .then(poster => {
            res.send({poster: poster.data.poster_path});
        })
        .catch(err => {
            res.status(500).send(err);
        })
    })
    .catch(err => {
        res.status(500).send(err);
    })
})

router.route('/tv/:id/season/:season/episode/:episode').get((req, res) => {
    let str = addPathToUrl(base_url, ['tv', req.params.id, 'season', req.params.season, 'episode', req.params.episode]);
    let params = setParams({"append_to_response": "videos,images", "include_image_language": "en,null"}).toString();

    axios.get(`${str}?${params}`)
    .then(result => {
        res.send(result.data)
    })
    .catch(err => {
        res.status(500).send(err);
    })
})


function setParams(obj) {
    const params = new URLSearchParams();
    params.set("api_key", API_KEY);
    params.set("language", "en-US");
    params.set("include_adult", "false");

    const entries = Object.entries(obj);
    for (entry of entries) {
        params.set(entry[0], entry[1]);
    }
    return params
}

function addPathToUrl(url, pathArray) {
    for (path of pathArray) {
        url += `/${path}`
    }
    return url
}

module.exports = router;
