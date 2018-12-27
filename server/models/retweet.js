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

  tweetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
}, {
    timestamps: true
});

module.exports = mongoose.model('Retweet', schema);
