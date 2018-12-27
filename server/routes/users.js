const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const User = require('../models/user');
const Tweets = require('../models/tweet');
const Relationship = require('../models/relationship');
const Like = require('../models/like');
const upload_avatar = require('../modules/upload_avatar');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;
const fs = require('fs');

// get user
router.get('/:username', (req, res) => {
  if(!req.params.username) return;
  User.findOne({username: req.params.username}).select('-password').exec((err, user) => {
    if(err) res.send({success: false, msg: err});
    jwt.verify(req.headers.authorization, secret, async(err, account) => {
      if(err) res.send({success: true, user});
      if(account) {
        var c = await Relationship.count({followerId: account._id, followedId: user._id});
        if(c > 0) {
          user.followed = true;
        }
      }
      res.send({success: true, user});
    });
  });
});

// sign up
router.post('/signup', async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confirmation = req.body.confirmation;
  var valid = false; //req.validationErrors();
  var msg = '';

  var userCount = await User.count({username});
  var emailCount = await User.count({email});
  if(userCount == 0) userCount = await User.count({usernameLowerCase: username.toLowerCase()});
  if(emailCount == 0) emailCount = await User.count({emailLowerCase: email.toLowerCase()});

  if(userCount > 0) {
    msg = 'Error: Username is already taken.';
  } else if(emailCount > 0) {
    msg = 'Error: Email is already taken.';
  } else if(username.length == 0) {
    msg = 'Error: Username is empty.';
  } else if(username.length < 2) {
    msg = 'Error: Username is too short.';
  } else if(username.length > 16) {
    msg = 'Error: Username is too long.';
  } else if (email.length == 0) {
    msg = 'Error: Email is empty.';
  } else if (email.length > 32) {
    msg = 'Error: Email is too long.';
  } else if(email.indexOf('@') == -1) {
    msg = 'Error: Email is invalid.';
  } else if(email.length < 5) {
    msg = 'Error: Email is too short.';
  } else if(password.length == 0) {
    msg = 'Error: Password is empty.';
  } else if(password.length < 4) {
    msg = 'Error: Password is too short.';
  } else if(confirmation.length == 0) {
    msg = 'Error: "Confirm password" is empty.';
  } else if(confirmation != password) {
    msg = 'Error: Password confirmation is not correct.';
  } else {
    valid = true;
  }

  if(!valid) {
    res.send({success: false, msg: msg});
    return;
  } else {
    var newUser = new User({
      username: username,
      email: email,
      usernameLowerCase: username.toLowerCase(),
      emailLowerCase: email.toLowerCase(),
      password: password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      } else {
        //var token = jwt.sign(newUser.toJSON(), secret);
        //res.json({success: true, msg: 'Created new user.'}); //token: token});
        log_in(res, username, password);
      }
    });
  }
});

// log in
router.post('/login', (req, res) => {
  if(req == null || res == null) return;

  var username = req.body.username;
  var password = req.body.password;
  if(!username) {
    res.send({success: false, msg: 'Username is empty.'});
    return;
  }

  if(!password) {
    res.send({success: false, msg: 'Password is empty.'});
    return;
  }

  log_in(res, username, password);
});

function log_in(res, username, password) {
  User.findOne({$or: [{username: username}, {usernameLowerCase: username.toLowerCase()}]}).select('+password').exec((err, user) => {
    if (err) res.send({success: false, msg: 'Login failed...'});
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), secret);
          // return the information including token as JSON
          user.password = '';
          console.log('user='+JSON.stringify(user));
          res.json({success: true, token: token, user: user});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
}

// log out
router.get('/logout', (req, res) => {
  console.log('logout');
  //req.logout();
  res.send({success: true, msg: 'You are logged out.'});
});

// edit profile
router.post('/edit', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  console.log('username='+user.username);

  upload_avatar(req, res, user, async (images) => {
    var username = req.body.username;
    var email = req.body.email;
    var bio = req.body.bio;
    var valid = false;
    var c = 0;
    try {
      c = await User.count({username: username});
    } catch(err) {}

    if(c > 0 && username != user.username) {
      res.send({success: false, msg: 'Error: Username is already taken.'});
    } else if(username.length == 0) {
      res.send({success: false, msg: 'Error: Username is empty.'});
    } else if(username.length < 2) {
      res.send({success: false, msg: 'Error: Username is too short.'});
    } else if(username.length > 16) {
      res.send({success: false, msg: 'Error: Username is too long.'});
    } else if (email.length == 0) {
      res.send({success: false, msg: 'Error: Email is empty.'});
    } else if (email.length > 32) {
      res.send({success: false, msg: 'Error: Email is too long.'});
    } else if(email.indexOf('@') == -1) {
      res.send({success: false, msg: 'Error: Email is invalid.'});
    } else if(email.length < 5) {
      res.send({success: false, msg: 'Error: Email is too short.'});
    } else if(bio.length > 256) {
      res.send({success: false, msg: 'Error: Bio is too long.'});
    } else {
      valid = true;
    }

    if(!valid) return;

    var newData = {
      name: req.body.name,
      username: req.body.username,
      email : req.body.email,
      bio: req.body.bio
    }
    if(images.avatar) newData.avatar = images.avatar;
    if(images.bg) newData.bg = images.bg;
    console.log('newData='+JSON.stringify(newData));
    User.findOneAndUpdate({_id: user._id}, newData, (err) => {
      if(err) res.send({success: false, msg: err});
      else {
        newData._id = user._id;
        res.send({success: true, msg: 'User profile is updated.', user: newData});
      }
    });
  });
});

module.exports = router;
