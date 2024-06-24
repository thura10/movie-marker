const express = require('express');
const router = express.Router();

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const bcrypt = require('bcryptjs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const BCRYPT_SALT_ROUNDS = 12;

var db;

const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_HOST}?retryWrites=true&w=majority`;
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then((database) => {
  db = database.db('movieMarker');
})
.catch((err) => {
  console.log(err)
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
            res.send([{"auth": true, "username": result.username, verify: result.verify}]);
            return
        }
        res.send([{"auth": false}]);
    })
})

router.route('/auth/admin').post((req, res) => {
    db.collection('users').findOne({"_id": ObjectId(req.body.id)}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            const admin = (result.role && result.role.includes('admin'));
            res.send({"admin": admin});
            return;
        }
        res.send({"admin": false});
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
                    {"username": username, "email": email, "password": hash, "verify": false},
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

router.route('/admin/get/:_id').get((req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.role && result.role.includes('admin')) {
            db.collection('users').find({}).toArray((err, result) => {
                if (err) return console.log(err);
                res.send(result);
            })
        }
        else res.send([]);
    })
})
router.route('/admin/delete/:_id').delete((req, res) => {
    db.collection("users").deleteOne({_id: ObjectId(req.params._id), role: {$ne: 'admin'}}, (err, result) => {
        if (err) return console.log(err);
        res.send({'delete': true});
    })
})
router.route('/admin/demote/:_id').put((req, res) => {
    db.collection('users').updateOne({_id: ObjectId(req.params._id), role: 'admin'}, {$pull: {role: 'admin'}}, (err, result) => {
        if (err) return console.log(err);
        res.send({'demote': true});
    })
})
router.route('/admin/promote/:_id').put((req, res) => {
    db.collection('users').updateOne({_id: ObjectId(req.params._id)}, {$addToSet: {role: 'admin'}}, (err, result) => {
        if (err) return console.log(err);
        res.send({'demote': true});
    })
})

router.get('/dashboard/nextup/:_id', (req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.watched) {
            let promises = [];
            for (tv of result.watched) {
                if (tv.type === 'tv') promises.push(axios.get(`https://api.themoviedb.org/3/tv/${tv.id}?api_key=ef0b54d540e68c2dd4a0ff428b46161c&language=en-US`))
            }
            Promise.allSettled(promises)
            .then(result2 => {
                res.status(200).send(result2.filter(promiseResult => promiseResult.status === 'fulfilled').map((item) => item.value.data));
            })
            .catch(err => {
                res.status(200).send([]);
            })
        }
        else res.send([]);
    })
})

router.get('/dashboard/foryou/:_id', (req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result && (result.watched || result.favourite)) {
            let favourite = result.favourite ? result.favourite.slice(-50) : [];
            let watched = result.watched ? result.watched.slice(-50) : [];

            let foryou = [];
            for (fav of favourite) foryou.push(100);
            for (watch of watched) foryou.push(10);

            //get recommended items of most recent watched and favourite items
            let items = favourite.concat(watched);
            let promises = [];
            for (let item of items) {
                let url = `https://api.themoviedb.org/3/${item.type}/${item.id}/recommendations?api_key=ef0b54d540e68c2dd4a0ff428b46161c&language=en-US`;
                promises.push(axios.get(url))
            }
            Promise.allSettled(promises)
            .then(results => {
                let result = results.filter(promiseResult => promiseResult.status === 'fulfilled').map(item => item.value.data);
                let combined_results = [];

                //assign a score and limit the recommendations for each item
                for (let i=0; i < result.length; i++) {
                    for (let item of result[i].results.slice(0, Math.floor(200/result.length))) {
                        item.foryou = foryou[i];
                        combined_results.push(item);
                    }
                }

                //increase the score for items recommended more than once
                let foryouItems = [];
                let added = {};
                for (let item of combined_results) {
                    let occurrences = combined_results.filter(a => a.id == item.id && (a.title == item.title || a.name == item.name));
                    item.foryou = occurrences.reduce((a,b) => a + b.foryou, 0)
                    if (!added[item.id]) {
                        foryouItems.push(item);
                        added[item.id] = true;
                    }
                }
                res.send(foryouItems.sort((a, b) => b.foryou - a.foryou))
            })
            .catch(err => {
                res.send([]);
            })
        }
        else res.send([]);
    })
})
//send email to reset pw
router.route('/auth/:email/reset').get((req, res) => {
    db.collection('users').findOne({email: req.params.email}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            let pin = sendEmail(req.params.email, result.username, "Reset your password");
            db.collection('users').updateOne({email: req.params.email}, {$set: {pin: pin}}, (err, result) => {
                if (err) return console.log(err);
                res.send({email: true});
            })
        }
        else {
            res.send({email: false});
        }
    })
})
//send email to verify account
router.route('/auth/:_id/verify').get((req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params._id)}, (err, result) => {
        if (err) return console.log(err);
        if (result) {
            let pin = sendEmail(result.email, result.username , "Verify your email");
            db.collection('users').updateOne({_id: ObjectId(req.params._id)}, {$set: {pin: pin}}, (err, result) => {
                if (err) return console.log(err);
                res.send({email: true});
            })
        }
        else {
            res.send({email: false});
        }
    })
})
router.route('/auth/:email/pin/:pin').get((req, res) => {
    db.collection('users').findOne({email: req.params.email}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.pin && result.pin == req.params.pin) {
            db.collection('users').updateOne({email: req.params.email}, {$set: {verify: true}}, (err, result2) => {
                if (err) return console.log(err);
                res.send({verify: true})
            })
        }
        else res.send({verify: false})
    })
})
router.route('/verify/:id/pin/:pin').get((req, res) => {
    db.collection('users').findOne({_id: ObjectId(req.params.id)}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.pin && result.pin == req.params.pin) {
            db.collection('users').updateOne({_id: ObjectId(req.params.id)}, {$set: {verify: true}}, (err, result2) => {
                if (err) return console.log(err);
                res.send({verify: true})
            })
        }
        else res.send({verify: false})
    })
})
router.route('/auth/:email/pin/:pin/').post((req, res) => {
    db.collection('users').findOne({email: req.params.email}, (err, result) => {
        if (err) return console.log(err);
        if (result && result.pin && result.pin == req.params.pin) {
            bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS, function(err, hash) {
                db.collection('users').updateOne({email: req.params.email}, {$set: {password: hash}}, (err, result2) => {
                    if (err) return console.log(err);
                    res.send({change: true})
                })
            })
        }
        else {
            res.send({change: false})
        }
    })
})


function sendEmail(email, username, reason) {
    let pin = Math.floor(100000 + Math.random() * 900000);

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'dineandwhine.contact@gmail.com',
          pass: 'wyjzu6-biwquC-mazpyq'
        }
    });

    var mailOptions = {
        from: 'dineandwhine.contact@gmail.com',
        to: email,
        subject: `${reason} for Movie Marker`,
        text: `Hello ${username}, The pin to ${reason.toLowerCase()} is ${pin}.`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        }
        else {
          console.log('Email sent: ' + info.response);
        }
    });
    return pin;
}

module.exports = router
