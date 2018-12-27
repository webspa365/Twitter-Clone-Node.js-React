var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  tweetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  dislike: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('Like', schema);
