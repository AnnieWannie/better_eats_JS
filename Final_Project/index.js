var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require("mongoose");

var dbconfig = require("./config/database");
var passport = require("passport");

var cors = require("cors");
var session = require("express-session");
var MongoStore = require('connect-mongo');

var usersRouter = require('./routes/users');
var betterEatsRoutes = require('./routes/betterEats.js');

require("./config/passport")(passport);

mongoose.connect( process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db = mongoose.connection;

db.once("open", function(){
  console.log("Connected to Mongo.")
})

db.on("error", function (err){
  console.log("Error accessing Database")
})

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  },
}));

app.use(passport.initialize());
app.use(passport.session(
  {
  pauseStream: true
  }
));

app.use(cors())

let Restaurant = require("./models/restaurant")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.get("*", function(req, res, next){
  res.locals.user = req.user || null;
  next();
})


app.use('/app', betterEatsRoutes);
app.use('/users', usersRouter);

app.use("/", function (req, res) {
  Restaurant.find({}, function (err, restaurants) {
    if (err) {
      console.log("error");
    } else {
      res.render("index", {
        'title': "Better Eats",
        'restaurants': restaurants,
      });
    }
  });
});

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

module.exports = app;
