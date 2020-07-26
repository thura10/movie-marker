const express = require('express');
const router = express.Router();

const axios = require('axios');

const API_KEY = "ef0b54d540e68c2dd4a0ff428b46161c";
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