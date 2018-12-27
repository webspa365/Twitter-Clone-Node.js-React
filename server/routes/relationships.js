const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Relationship = require('../models/relationship');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

function get_user(req, res) {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  return user;
}

router.get('/unfollowing', (req, res) => {
  var user = get_user(req, res);
  var users = [];
  var ids = [user._id];
  console.log('00');
  Relationship.find({followerId: user._id}, (err, rows) => {
    if(err) res.send({success: false, msg: err});
    console.log('01');
    for(var row of rows) {
      ids.push(row.followedId);
    }
    User.find({_id: {$nin: ids}}).limit(10).exec((err, users) => {
      if(err) res.send({success: false, msg: err});
      console.log('02');
      if(!users || users.length < 1) res.send({success: false, msg: 'No more users.'});
      else res.send({success: true, users});
    });
  });
});

// get following by user
router.get('/following', (req, res) => {
  var userId = req.query.userId;
  Relationship.find({followerId: userId}, async(err, rows) => {
    var users = [];
    for(var i=0; i<rows.length; i++) {
      var u = await User.findOne({_id: rows[i].followedId}).exec();
      u.followed = true;
      users.push(u);
    }
    res.send({success: true, users});
  });
});

// get followers at user
router.get('/followers', (req, res) => {
  var userId = req.query.userId;
  Relationship.find({followedId: userId}, async(err, rows) => {
    var users = [];
    for(var i=0; i<rows.length; i++) {
      var u = await User.findOne({_id: rows[i].followerId}).exec();
      users.push(u);
    }
    res.send({success: true, users});
  });
});

router.get('/followed', (req, res) => {
  var user = get_user(req, res);
  var obj = {
    followerId: user._id,
    followedId: req.query.followedId
  }
  console.log('followedId='+req.query.followedId);
  Relationship.count(obj, (err, c) => {
    if(err) res.send(err);
    if(c == 0) res.send({success: true, followed: false});
    else if(c > 0) res.send({success: true, followed: true});
  });
});

router.post('/follow', (req, res) => {
  var user = get_user(req, res);
  User.findOne({username: req.body.username}, (err, row) => {
    if(err) res.send(err);
    var obj = {
      followerId: user._id,
      followedId: row.id
    };
    Relationship.count(obj, (err, c) => {
      if(err) res.send(err);
      else if(c == 0) {
        // follow
        obj = new Relationship(obj);
        obj.save((err) => {
          if(err) res.send(err);
          else {
            update_counts(obj, function(counts) {
              res.send({
                success: true,
                followed: true,
                following: counts.following,
                followers: counts.followers
              });
            });
          }
        });
      } else {
        // unfollow
        Relationship.findOneAndRemove(obj, (err) => {
          if(err) res.send(err);
          else {
            update_counts(obj, function(counts) {
              res.send({
                success: true,
                followed: false,
                following: counts.following,
                followers: counts.followers
              });
              console.log('log=unfollowed');
            });
          }
        });
      }
    });
  });
});

function update_counts(obj, cb) {
  console.log('obj='+JSON.stringify(obj));
  Relationship.count({followerId: obj.followerId}, (err, following) => {
    if(err) following = 0;
    User.findOneAndUpdate({_id: obj.followerId}, {following}, (err) => {
      Relationship.count({followedId: obj.followedId}, (err, followers) => {
        if(err) followers = 0;
        User.findOneAndUpdate({_id: obj.followedId}, {followers}, (err) => {
          if(err) console.log(err);
          cb({
            following: following,
            followers: followers
          });
        });
      });
    });
  });
}

module.exports = router;
