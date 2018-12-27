const express = require('express');
const router = express.Router();
const Like = require('../models/like');
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

// get user liked or not
router.get('/liked', (req, res) => {
  var user = get_user(req, res);
  var obj = {
    userId: user._id,
    tweetId: req.query.tweetId
  };
  Like.count(obj, (err, c) => {
    if(err) res.send(err);
    if(c == 0) {
      // not liked by user
      res.send({success: true, liked: false})
    } else {
      // liked by user
      res.send({success: true, liked: true})
    }
  });
});

// like or unlike a post
router.post('/post', (req, res) => {
  console.log('likes/post');
  var user = get_user(req, res);
  var obj = {
    userId: user._id,
    tweetId: req.body.tweetId
  };
  Like.count(obj, (err, c) => {
    if(c == 0) {
      // like
      var like = new Like(obj);
      like.save((err) => {
        update_counts(obj, function(userC, postC) {
          res.send({success: true, liked: true, userLikes: userC, postLikes: postC});
        });
      });
    } else {
      // unlike
      Like.findOneAndRemove(obj, (err) => {
        update_counts(obj, function(userC, postC) {
          res.send({success: true, liked: false, unlikedId: obj.tweetId, userLikes: userC, postLikes: postC});
        });
      });
    }
  });
});

function update_counts(obj, cb) {
  Like.count({userId: obj.userId}, (err, userC) => {
    User.findOneAndUpdate({_id: obj.userId}, {likes: userC}, (err) => {
      Like.count({tweetId: obj.tweetId}, (err, postC) => {
        Tweet.findOneAndUpdate({_id: obj.tweetId}, {likes: postC}, (err) => {
          cb(userC, postC);
        });
      });
    });
  });
}

module.exports = router;
