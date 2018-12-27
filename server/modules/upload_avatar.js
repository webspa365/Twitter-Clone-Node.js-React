const multer = require('multer');
const path = require('path');
const fs = require('fs');
const gm = require('gm');

module.exports = async function(req, res, user, callback) {
  // check if user dirs exist
  var userPath = './public/images/'+user._id;
  var avatarPath = userPath + '/avatar/';
  var bgPath = userPath + '/bg';
  var ext = '';
  var names = {avatar: '', bg: ''};
  var oldPath = '';

  //await fs.rmdirSync(avatarPath);
  //await fs.rmdirSync(bgPath);

  mkdirs(userPath, () => {
    console.log('after mkdirs()');
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        var dest = null;
        if(file.fieldname == 'avatar') {
          dest = avatarPath;
        } else if(file.fieldname == 'bg') {
          dest = bgPath;
        }
        cb(null, dest);
      },
      filename: async(req, file, cb) => {
        //console.log('req='+JSON.stringify(req));
        var name = '';
        console.log('field='+file.fieldname);
        ext = path.extname(file.originalname);

        if(file.fieldname == 'avatar') {
          await unlink_in_dir(avatarPath);
          var date = Date.now();
          names.avatar = date+ext;
          name = names.avatar;

        } else if(file.fieldname == 'bg') {
          await unlink_in_dir(bgPath);
          var date = Date.now();
          names.bg = date+ext;
          name = names.bg;

        } else {
          callback('');
        }
        cb(null, name); // + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: {fileSize: (20 * 1024 * 1024)},
      fileFilter: function(req, file, cb) {checkFileType(file, cb);}
    }).any(); //.array('avatar, bg', 2);

    upload(req, res, async(err) => {
      if(err) callback('');
      else {
        await resize_avatar(avatarPath+'/'+names.avatar);
        await resize_bg(bgPath+'/'+names.bg);

        console.log('New image uploaded.');
        setTimeout(() => {
          callback(names);
        }, 500);

      }
    });
  });
};

function unlink_in_dir(dest) { // remove files in specific dir
  console.log('remove_dir()='+dest);
  fs.readdir(dest, (err, files) => {
    if (err) throw err;
    if(!files) return;
    for (const file of files) {
      fs.unlink(path.join(dest, file), err => {
        if (err) throw err;
      });
    }
  });
}

function resize_avatar(dest) {
  var width = 150;
  if(fs.existsSync(dest)) {
    gm(dest).size(function(err, size) {
      if(err) return;
      var w, h;
      if(size.width > size.height) {
        w = null;
        h = width;
      } else {
        w = width;
        h = null;
      }
      gm(dest).resize(w, h, '!').write(dest, () => {
        gm(dest).crop(width, width, 0, 0).write(dest, () => {
          gm(dest).resize(width/2, width/2, '!')
          .write(path.dirname(dest)+'/thumb-'+path.basename(dest), () => {
            //cb();
          });
        });
      });
    });
  }
}

function resize_bg(dest) {
  if(fs.existsSync(dest)) {
    gm(dest).size(function(err, size) {
      if(err) return;
      var w, h;
      if(size.height < (size.width/4)) {
        w = null;
        h = 200;
      } else {
        w = 800;
        h = null;
      }
      gm(dest).resize(w, h, '!').write(dest, () => {
        gm(dest).crop(800, 200, 0, 0).write(dest, () => {
          gm(dest).resize(300, 75, '!')
          .write(path.dirname(dest)+'/thumb-'+path.basename(dest), () => {
            //cb();
          });
        });
      });
    });
  }
}

// make dirs (async)
async function mkdirs(userPath, cb) {
  try {
    var images = './public/images';
    var avatar = userPath+'/avatar';
    var bg = userPath+'/bg';
    var posts = userPath+'/posts';
    Promise.all([
      makeDir(images),
      makeDir(userPath),
      makeDir(avatar),
      makeDir(bg),
      makeDir(posts)
    ]).then(cb());
  } catch(err) {}
}


function makeDir(dest) {
  if(!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
}

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}
