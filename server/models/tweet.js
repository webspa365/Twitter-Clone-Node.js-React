var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  username: {
    type: String,
    required: true,
    default: ''
  },

  tweet: {
    type: String,
    required: true,
    default: ''
  },

  dir: {
    type: String,
    required: false,
    default: ''
  },

  images: {
    type: Array,
    required: false,
    default: [String]
  },

  video: {
    type: String,
    required: false,
    default: ''
  },

  replies: {
    type: Number,
    require: true,
    default: 0
  },

  retweets: {
    type: Number,
    require: true,
    default: 0
  },

  likes: {
    type: Number,
    require: true,
    default: 0
  },

  dislikes: {
    type: Number,
    require: true,
    default: 0
  },

  bookmarks: {
    type: Number,
    require: true,
    default: 0
  },

  hashtags: {
    type: Array,
    require: false,
    default: [String]
  },

  liked: {
    type: Boolean,
    require: true,
    default: false
  },

  retweeted: {
    type: Boolean,
    require: true,
    default: false
  },

  time: {
    type: Number,
    require: true,
    default: 0
  },

  retweetedBy: {
    type: String,
    require: true,
    default: ''
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tweet', schema);
