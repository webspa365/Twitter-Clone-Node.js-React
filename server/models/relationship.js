var mongoose = require('mongoose');

var schema = mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  followedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  block: {
    type: Boolean,
    required: false
  }
});

module.exports = mongoose.model('Relationship', schema);
