var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var schema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  usernameLowerCase: {
    type: String,
    required: true,
    default: ''
  },

  email: {
    type: String,
    required: true
  },

  emailLowerCase: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  name: {
    type: String,
    required: false,
    default: ''
  },

  bio: {
    type: String,
    required: false,
    default: ''
  },

  avatar: {
    type: String,
    required: false,
    default: ''
  },

  bg: {
    type: String,
    required: false,
    default: ''
  },

  tweets: {
    type: Number,
    required: true,
    default: 0
  },

  retweets: {
    type: Number,
    required: true,
    default: 0
  },

  following: {
    type: Number,
    required: true,
    default: 0
  },

  followers: {
    type: Number,
    required: true,
    default: 0
  },

  likes: {
    type: Number,
    required: true,
    default: 0
  },

  dislikes: {
    type: Number,
    required: true,
    default: 0
  },

  bookmarks: {
    type: Number,
    required: true,
    default: 0
  },

  followed: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

schema.pre('save', function (next) {
  var newUser = this;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      if(err) {
        console.log(err);
        return;
      } else {
        newUser.password = hash;
        next();
      }
    });
  });
});

schema.methods.comparePassword = function (pw, cb) {
  bcrypt.compare(pw, this.password, function (err, isMatch) {
    if (err) {
        return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', schema);
