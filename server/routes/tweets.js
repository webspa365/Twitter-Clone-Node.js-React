const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;
const get_avatars = require('../modules/get_avatars');
const User = require('../models/user');
const Tweet = require('../models/tweet');
const Retweet = require('../models/retweet');
const Like = require('../models/like');
const Relationship = require('../models/relationship');

var limit = 5;
var msg = '';
var valid = false;

function get_user(req, res) {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    return user;
  }
}

function count_and_update(userId, cb) {
  Tweet.count({userId}, (err, tweetC) => {
    Like.count({userId}, (err, likeC) => {
      User.findOneAndUpdate({_id: userId}, {tweets: tweetC, likes: likeC}, (err) => {
        clean_up_likes({userId}, () => {
          cb(tweetC, likeC);
        });
      });
    });
  });
}

function clean_up_likes(query, cb) {
  Like.find(query).exec(async(err, likes) => {
    var len = likes.length;
    for(var i=0; i<len; i++) {
      var c = await Tweet.count({_id: likes[i].tweetId});
      if(c == 0) await likes[i].remove();
    }
    cb();
  });
}

router.get('/timeline', (req, res) => {
  jwt.verify(req.headers.authorization, secret, (err, user) => { // get account user
    if(err) res.send({success: false, msg: err});
    if(!user) return;
    var skip = parseInt(req.query.skip);
    var rSkip = parseInt(req.query.rSkip);
    var ids = [user._id];
    Relationship.find({followerId: user._id}, (err, rows) => {
      if(err) res.send({success: false, msg: err});
      if(rows.length > 0) {
        for(var row of rows) {
          ids.push(row.followedId);
        }
      }
      console.log('ids='+ids.length);
      console.log(skip+'/'+rSkip);
      get_tweets({userId: {$in: ids}}, skip, limit, user, (tweets) => {
        if(!tweets) res.send({success: false, msg: 'Error: get_tweets()'});
        get_retweets({userId: {$in: ids}, createdAt: {$gte: tweets[0].createdAt}}, rSkip, user, (retweets) => {
          var arr = tweets;
          if(retweets) {
            // sort array of tweets and retweets by time
            var arr = retweets.concat(tweets);
            arr.sort((a, b) => {
              if (a.time < b.time)
                return 1;
              if (a.time > b.time)
                return -1;
              return 0;
            });
          }
          get_avatars(arr, (avatars) => {
            res.send({success: true, tweets: arr, avatars});
          });
        });
      });
    });
  });
});

router.get('/tweets', (req, res) => {
  if(!req.query) return;
  var user = '';
  jwt.verify(req.headers.authorization, secret, (err, u) => { // get account user
    if(!err) user = u;
    var username = req.query.username;
    var skip = parseInt(req.query.skip);
    var rSkip = parseInt(req.query.rSkip);
    get_tweets({username}, skip, limit, user, (tweets) => {
      if(!tweets) res.send({success: false, msg: 'Error: get_tweets()'});
      get_retweets({username, createdAt: {$gte: tweets[0].createdAt}}, rSkip, user, (retweets) => {
        var arr = tweets;
        if(retweets) {
          // sort array of tweets and retweets by time
          var arr = retweets.concat(tweets);
          arr.sort((a, b) => {
            if (a.time < b.time)
              return 1;
            if (a.time > b.time)
              return -1;
            return 0;
          });
        }
        get_avatars(arr, (avatars) => {
          res.send({success: true, tweets: arr, avatars});
        });
      });
    });
  });
});

router.get('/likedTweets', (req, res) => {
  if(!req.query) return;
  var user = jwt.verify(req.headers.authorization, secret);
  var userId = req.query.userId;
  var skip = parseInt(req.query.skip);
  get_likes({userId}, skip, limit, user, (tweets) => {
    get_avatars(tweets, (avatars) => {
      res.send({success: true, tweets, avatars});
    });
  });
});

function get_tweets(query, skip, limit, user, cb) {
  Tweet.find(query).sort({'createdAt': -1}).skip(skip).limit(limit).exec(async(err, tweets) => {
    if(err) {
      console.log(err);
      cb(null)
    } else if(tweets.length > 0) {
      if(user) {
        // liked or not, and retweeted or not
        for(var i=0; i<tweets.length; i++) {
          var likes = await Like.count({userId: user._id, tweetId: tweets[i]._id});
          if(likes > 0) tweets[i].liked = true;
          else tweets[i].liked = false;
          var retweets = await Retweet.count({userId: user._id, tweetId: tweets[i]._id});
          if(retweets > 0) tweets[i].retweeted = true;
          else tweets[i].retweeted = false;
        }
      }
      // insert time from createdAt
      for(var t of tweets) {
        var time = t.createdAt;
        t.time = time;
      }
      cb(tweets);
    } else {
      cb(null);
    }
  });
}

/* get retweeted tweets */
function get_retweets(query, skip, user, cb) {
  Retweet.find(query).sort({'createdAt': -1}).skip(skip).exec((err, retweets) => {
    if(err) {
      console.log(err);
      cb(null);
    }
    if(retweets.length > 0) {
      var ids = [];
      for(var i=0; i<retweets.length; i++) {
        ids.push(retweets[i].tweetId);
      }
      if(ids.length > 0) {
        get_tweets({_id: {$in: ids}}, 0, 100, user, (tweets) => {
          if(!tweets) {
            console.log('Error: get_retweets() get_tweets()');
            cb(null);
          }
          // sort by retweet's ids
          var arr = [];
          for(var i=0; i<retweets.length; i++) {
            for(var j=0; j<tweets.length; j++) {
              if(retweets[i].tweetId.equals(tweets[j]._id)) {
                tweets[j].time = retweets[i].createdAt;
                tweets[j].retweetedBy = '@'+retweets[i].username;
                arr.push(tweets[j]);
              }
            }
          }
          //arr.reverse();
          cb(arr);
        });
      }
    } else {
      cb(null);
    }
  });
}

/* get liked tweets */
function get_likes(query, skip, limit, user, cb) {
  Like.find(query).sort({'createdAt': -1}).skip(skip).limit(limit).exec((err, likes) => {
    if(err) res.send({success: false, msg: err});
    var ids = [];
    for(var i=0; i<likes.length; i++) {
      ids.push(likes[i].tweetId);
    }
    if(ids.length > 0) {
      get_tweets({_id: {$in: ids}}, 0, 100, user, (tweets) => {
        // sort by ids
        var arr = [];
        for(var i=0; i<ids.length; i++) {
          for(var j=0; j<tweets.length; j++) {
            if(ids[i].equals(tweets[j]._id)) {
              arr.push(tweets[j]);
            }
          }
        }
        arr.reverse();
        cb(arr)
      });
    }
  });
}



router.post('/post', (req, res) => {
  var user = get_user(req, res);
  var tweet = req.body.tweet;
  if(tweet.length < 1) msg = 'Tweet is empty.';
  else if(tweet.length > 280) msg = 'Tweet is too long.';
  else valid = true;
  if(!valid) {
    res.send({success: false, msg: msg});
    return;
  }
  var newTweet = new Tweet({
    userId: user._id,
    username: user.username,
    tweet: tweet
  });
  newTweet.save(async(err, tweet) => {
    if(err) res.send({success: false, msg: err});
    count_and_update(user._id, (c) => {
      res.send({success: true, tweet, count: c});
    });
  });
});

router.post('/delete', (req, res) => {
  var user = get_user(req, res);
  var tweetId = req.body.tweetId;
  Tweet.findOne({_id: tweetId}, (err, tweet) => {
    if(err) res.send({success: false, msg: err});
    if(tweet && tweet.userId.equals(user._id)) {
      tweet.remove((err) => {
        if(err) res.send({success: false, msg: err});
        Like.find({tweetId: tweetId}, async(err, likes) => {
          if(likes) {
            var len = likes.length;
            for(var i=0; i<len; i++) {
              await likes[i].remove();
            }
          }
          count_and_update(user._id, (tweetC, likeC) => {
            res.send({success: true, deletedId: tweet._id, tweetC, likeC});
          });
        });
      });
    }
  });
});



module.exports = router;
