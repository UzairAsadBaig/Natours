const AppError = require('../utils/appError');

const handleJWTVerificationError = function () {
  return new AppError('Invalid token passed!', 401);
};

const handleJWTExpiryError = function () {
  return new AppError('Token is expired!', 401);
};

const handleDuplicateFieldDB = function (error) {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  message = `Invalid duplicated field : ${value} , Try another value!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = function (error) {
  message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
};

const handleValidationDB = function (error) {
  const errors = Object.values(error.errors).map((err) => err.message);
  message = errors.join('. ');
  return new AppError(message, 400);
};

// Development Error
const errDevelopment = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Development Error
const errProduction = function (err, res) {
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //! 1)Log the actual error details
    console.error(err);
    //? 2)Hide the error details on response
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    errDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    const error = err;
    let finalError;

    if (error.name === 'CastError') finalError = handleCastErrorDB(error);
    if (error.code === 11000) finalError = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      finalError = handleValidationDB(error);
    if (error.name === 'JsonWebTokenError')
      finalError = handleJWTVerificationError();
    if (error.name === 'TokenExpiredError') finalError = handleJWTExpiryError();

    errProduction(!finalError ? error : finalError, res);
  }
  next();
};
