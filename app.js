var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aboutRouter = require('./routes/about');
var managerRouter = require('./routes/manager');
var matchRouter = require('./routes/match');
var matchHistoryRouter = require('./routes/matchHistory');
var pointRouter = require('./routes/point');
const session = require('express-session');


var app = express();
var expressLayouts = require('express-ejs-layouts');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'your_secret_key',  // 替換成更安全的隨機字串
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // 在 HTTPS 環境時應設為 true
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts); 
app.set('layout', 'layout');
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/users', usersRouter);
app.use('/manager', managerRouter)
app.use('/match',matchRouter)
app.use('/matchHistory',matchHistoryRouter)
app.use('/point',pointRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
