//Dependencies
const path = require('path');
const express = require(`express`);
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

//Creating template engine
app.set('view engine', 'pug');
// app.set('views', './views');
app.set('views', path.join(__dirname, 'views'));

//Providing a static path
app.use(express.static(path.join(__dirname, 'public')));

// Global Middleware
//Add security
app.use(helmet());
//Development mode logging
if (process.env.NODE_ENV == 'development') app.use(morgan('dev'));
//In order to access req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//Attach request time
app.use(function (req, res, next) {
  req.requestTime = new Date();
  next();
});
//Limit the number of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request sent! Please try again after 1 hour',
});
app.use('/api', limiter);
//Adding sanitization  fro Nosql injection
app.use(mongoSanitize());
//Adding XSS security(JS or HTML code)
app.use(xssClean());
// Preventing parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'sort',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  })
);

//Routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

//Mounting our middlewares
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', function (req, res, next) {
  next(
    new AppError(`Couldn't find ${req.originalUrl} url on the server!`, 404)
  );
});

app.use(globalErrorHandler);
module.exports = app;
