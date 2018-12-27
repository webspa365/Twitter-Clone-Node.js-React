User = require('../models/user');

module.exports = function (posts, cb) {
  var ids = [];
  if(posts) {
    for(var i=0; i<posts.length; i++) {
      ids.push(posts[i].userId);
    }
  }
  User.find({_id: {$in: ids}}).exec((err, users) => {
    avatars = {};
    for(var i=0; i<users.length; i++) {
      avatars[users[i].username] = users[i].avatar;
    }
    //console.log('avatars='+JSON.stringify(avatars));
    cb(avatars);
  });
}
