var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tweetsRouter = require('./routes/tweets');
var retweetsRouter = require('./routes/retweets');
var likesRouter = require('./routes/likes');
var relationshipsRouter = require('./routes/relationships');

var app = express();

const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const config = require('./modules/config');

// cors
app.use(cors());

// mongoose
mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
//  cookie: { secure: true }
}));

// passport
require('./modules/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tweets', tweetsRouter);
app.use('/retweets', retweetsRouter);
app.use('/likes', likesRouter);
app.use('/relationships', relationshipsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//module.exports = app;
var port = 5001;
app.listen(process.env.PORT || port, () => console.log('Example app listening on port '+port+'!'));
