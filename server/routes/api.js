const express = require('express');
const router = express.Router();

const axios = require('axios');

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const bcrypt = require('bcryptjs');
const BCRYPT_SALT_ROUNDS = 12;

const API_KEY = "ef0b54d540e68c2dd4a0ff428b46161c";
const base_url = "https://api.themoviedb.org/3";

var db;

const url = "mongodb+srv://test1:testone1@cluster0.dasrw.mongodb.net/test?retryWrites=true&w=majority"
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err, database) => {
    if (err) return console.log(err)
    db = database.db('movieMarker')
})

router.post('/user/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.collection('users').findOne({"username": username}, function(err, result) {
        if (err) return console.log(err);
        if (!result) {
            res.send([{"auth": false, "reason": "username"}])
            return;
        }
        else {
            bcrypt.compare(password, result.password, function(err, result2) {
                if (err || !result2) {
                    res.send([{"auth": false, "reason": "password"}])
                }
                else {
                    res.send([{"auth": true, "_id": result._id}])
                }
            })
        }
    })
});
router.route('/user/auth').post((req, res) => {
    const _id = req.body._id;
    db.collection('users').findOne({"_id": ObjectId(_id)}, function(err, result) {
        if (err) return console.log(err);
        if (result) {
            res.send([{"auth": true, "username": result.username}]);
            return
        }
        res.send([{"auth": false}]);
    })
})

router.route('/user/register').post(function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    db.collection('users').findOne({"username": username}, function(err, res2) {
        if (res2 != null) {
            res.send([{"register": false, "reason": "username"}]);
            return
        }
        db.collection('users').findOne({"email": email}, function(err, res3) {
            if (res3 != null) {
                res.send([{"register": false, "reason": "email"}]);
                return
            }
            bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function(err, hash) {
                db.collection('users').insertOne(
                    {"username": username, "email": email, "password": hash},
                    (err, result) => {
                        if (err) return console.log(err);
                        let id = 0;
                        if (result.ops && result.ops.length) id = result.ops[0]._id
                        res.send([{"register": true, "_id": id}]);
                })
            })
        })
    })
})
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

module.exports = router