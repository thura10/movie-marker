const express = require('express');
const router = express.Router();

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const bcrypt = require('bcryptjs');
const axios = require('axios');
const BCRYPT_SALT_ROUNDS = 12;

var db;

const url = "mongodb+srv://test1:testone1@cluster0.dasrw.mongodb.net/test?retryWrites=true&w=majority"
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err, database) => {
    if (err) return console.log(err)
    db = database.db('movieMarker')
})

router.post('/login', (req, res) => {
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
router.route('/auth').post((req, res) => {
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

router.route('/register').post(function(req, res) {
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
                        if (result.ops && result.ops.length) id = result.ops[0]._id;
                        res.send([{"register": true, "_id": id}]);
                })
            })
        })
    })
})

router.route('/collection/new').post(function(req, res) {
    db.collection('collections').insertOne(
        {"name": req.body.name, "owner": req.body.owner, "owner_id": ObjectId(req.body.ownerId), "permissions": [], "items": []}, (err, result) => {
            if (err) return console.log(err);
            let id = 0;
            if (result.ops && result.ops.length) id = result.ops[0]._id;
            res.send({"_id": id});
        }
    )
})
router.route('/check/:username').get((req, res) => {
    db.collection('users').findOne({'username': req.params.username}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            res.send({"user": true})
            return;
        }
        res.send({"user": false});
    })
})
router.route('/collection/:_id/permission').get((req, res) => {
    db.collection('collections').findOne({'_id': ObjectId(req.params._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            res.send(result.permissions)
            return;
        }
        res.send([])
    })
})
router.route('/collection/:_id/permission').put((req, res) => {
    db.collection('collections').updateOne({'_id': ObjectId(req.params._id), 'owner_id': ObjectId(req.body.userId)}, {$set: {"permissions": req.body.permissions}}, (err, result) => {
        if (err) return console.log(err);
        res.send({"edit": "success"});
    })
})
router.route('/collection/:userId').get((req, res) => {
    db.collection('collections').find({"owner_id": ObjectId(req.params.userId)}).toArray((err, result) => {
        if (err) return console.log(err);
        res.send(result)
    })
})
router.route('/collection/:userId/shared').get((req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params.userId)}, (err, user) => {
        if (err) return console.log(err);
        if (user) {
            let username = user.username;
            db.collection('collections').find({'permissions': username}).project({items: 1, _id: 1, owner: 1, name: 1}).toArray((err, result) => {
                if (err) return console.log(err);
                res.send(result)
            })
        }
        else {
            res.send([]);
        }
    })
})
router.route('/collection').get((req, res) => {
    db.collection('collections').findOne({_id: ObjectId(req.query._id)}, (err, result) => {
        if (err) console.log(err);
        if (result && result.owner_id == req.query.userId) {
            res.send(result);
            return;
        }
        result.owner_id = '';
        result.permissions = [];
        res.send(result)
    })
})

router.route('/collection/delete').delete((req, res) => {
    db.collection('collections').findOne({_id: ObjectId(req.query._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result.owner_id == req.query.userId) {
            db.collection('collections').deleteOne({'_id': ObjectId(req.query._id), 'owner_id': ObjectId(result.owner_id)}, (err, result2) => {
                if (err) return console.log(err);
                res.send({"delete": true})
            })
        }
        else {
            db.collection('users').findOne({_id: ObjectId(req.query.userId)}, (err, result) => {
                if (err) return console.log(err);
                if (result) {
                    let username = result.username;
                    db.collection('collections').updateOne({"_id": ObjectId(req.query._id)}, { $pull: {"permissions": username} }, (err, result) => {
                        if (err) return console.log(err);
                        res.send({"delete": true})
                    })
                }
                else {
                    res.send({'delete': false});
                }
            })
        }
    })
})
router.route('/collection/edit').put((req, res) => {
    db.collection('collections').updateOne({'_id': ObjectId(req.body._id), 'owner_id': ObjectId(req.body.userId)}, {$set: {'name': req.body.name}} ,(err, result) => {
        if (err) return console.log(err);
        res.send(result)
    })
})
router.route('/collection/add').post((req, res) => {
    let item = {
        'type': req.body.type,
        'id': req.body.itemId,
        'poster_path': req.body.poster
    };

    req.body.type=='movie' ? item.title = req.body.name : item.name = req.body.name;

    db.collection('collections').updateOne({'_id': ObjectId(req.body._id), 'owner_id': ObjectId(req.body.userId)}, {$addToSet: {'items': item}}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            res.send({'add': true});
            return;
        }
        res.send({'add': false});
    })
})
router.route('/collection/remove').put((req, res) => {
    db.collection('collections').updateOne({'_id': ObjectId(req.body._id), 'owner_id': ObjectId(req.body.userId)}, {$pull: {"items": {'id': req.body.itemId, 'type': req.body.type}} }, { multi : true}, (err, result) => {
        if (err) return console.log(err);
        res.send({"remove": true});
    })
})
router.route('/collection/count/:userId').get((req, res) => {
    db.collection('collections').aggregate([
        { $match: { owner_id: ObjectId(req.params.userId) } },
        { $addFields: {
            movieCount: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'part',
                  cond: { $eq: ['$$part.type', 'movie']}
                }
              }
            },
            tvCount: {
                $size: {
                  $filter: {
                    input: '$items',
                    as: 'part',
                    cond: { $eq: ['$$part.type', 'tv']}
                  }
                }
              }
          }
        }
    ]).toArray((err, result) => {
        if (err) console.log(err);
        let movieCount = 0;
        let tvCount = 0;
        for (item of result) {
            movieCount += item.movieCount;
            tvCount += item.tvCount;
        }
        res.send({movieCount: movieCount, tvCount: tvCount})
    })
})

router.route('/watched/:userId').get((req, res) => {
    db.collection('users').findOne({'_id': ObjectId(req.params.userId)}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.watched) {
            res.send(result.watched)
        }
        else res.send([]);
    })
})
router.route('/favourite/:userId').get((req, res) => {
    db.collection('users').findOne({'_id': ObjectId(req.params.userId)}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.favourite) {
            res.send(result.favourite)
        }
        else res.send([]);
    })
})

router.route('/watched/:userId/add').post((req, res) => {
    let item = {
        'type': req.body.type,
        'id': req.body.itemId,
        'poster_path': req.body.poster
    };
    req.body.type=='movie' ? item.title = req.body.name : item.name = req.body.name;
    //get runtime and add it to watched item
    axios.get(`https://api.themoviedb.org/3/${req.body.type}/${req.body.itemId}?api_key=ef0b54d540e68c2dd4a0ff428b46161c&language=en-US`)
    .then(response => {
        if (req.body.type == 'movie' && response.data) {
            item.runtime = response.data.runtime;
        }
        else if (response.data) {
            let episodeRuntime = response.data.episode_run_time;
            item.episode_count = +response.data.number_of_episodes
            item.runtime = (episodeRuntime.length ? episodeRuntime[0] : 0) * item.episode_count;
        }
        db.collection('users').updateOne({'_id': ObjectId(req.params.userId)}, {$addToSet: {'watched': item}}, (err, result) => {
            if (err) return console.log(err);
            if (result) {
                res.send({'add': true});
                return;
            }
            res.send({'add': false})
        })
    })
    .catch(err => {
        console.log(err)
    })
})
router.route('/favourite/:userId/add').post((req, res) => {
    let item = {
        'type': req.body.type,
        'id': req.body.itemId,
        'poster_path': req.body.poster
    };
    req.body.type=='movie' ? item.title = req.body.name : item.name = req.body.name;

    db.collection('users').updateOne({'_id': ObjectId(req.params.userId)}, {$addToSet: {'favourite': item}}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            res.send({'add': true});
            return;
        }
        res.send({'add': false})
    })
})

router.route('/watched/:userId/remove').put((req, res) => {
    db.collection('users').updateOne({'_id': ObjectId(req.params.userId)}, {$pull: {"watched": {'id': req.body.itemId, 'type': req.body.type}} }, { multi : true}, (err, result) => {
        if (err) return console.log(err);
        res.send({"remove": true});
    })
})
router.route('/favourite/:userId/remove').put((req, res) => {
    db.collection('users').updateOne({'_id': ObjectId(req.params.userId)}, {$pull: {"favourite": {'id': req.body.itemId, 'type': req.body.type}} }, { multi : true}, (err, result) => {
        if (err) return console.log(err);
        res.send({"remove": true});
    })
})

module.exports = router