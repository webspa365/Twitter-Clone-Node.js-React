const express = require('express');
const router = express.Router();
const Retweet = require('../models/retweet');
const User = require('../models/user');
const Tweet = require('../models/tweet');
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

// get user retweeted or not
router.get('/retweeted', (req, res) => {
  var user = get_user(req, res);
  var obj = {
    userId: user._id,
    tweetId: req.query.tweetId
  };
  Retweet.count(obj, (err, c) => {
    if(err) res.send(err);
    if(c == 0) {
      // not liked by user
      res.send({success: true, retweeted: false})
    } else {
      // liked by user
      res.send({success: true, retweeted: true})
    }
  });
});

// retweet or remove retweet
router.post('/post', (req, res) => {
  console.log('retweets/post');
  var user = get_user(req, res);
  var obj = {
    userId: user._id,
    username: user.username,
    tweetId: req.body.tweetId
  };
  Retweet.count(obj, (err, c) => {
    if(c == 0) {
      // Retweet
      var retweet = new Retweet(obj);
      retweet.save((err) => {
        update_counts(obj, function(userC, postC) {
          res.send({success: true, retweeted: true, userC, postC});
        });
      });
    } else {
      // Remove retweet
      Retweet.findOneAndRemove(obj, (err) => {
        update_counts(obj, function(userC, postC) {
          res.send({success: true, retweeted: false, unlikedId: obj.tweetId, userC, postC});
        });
      });
    }
  });
});

function update_counts(obj, cb) {
  Retweet.count({userId: obj.userId}, (err, userC) => {
    User.findOneAndUpdate({_id: obj.userId}, {retweets: userC}, (err) => {
      Retweet.count({tweetId: obj.tweetId}, (err, postC) => {
        Tweet.findOneAndUpdate({_id: obj.tweetId}, {retweets: postC}, (err) => {
          cb(userC, postC);
        });
      });
    });
  });
}

module.exports = router;
