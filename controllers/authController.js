const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const users = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = function (res, statusCode, user) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    token,
    data: user,
  });
};

//Is Logged in
exports.isLoggedIn = catchAsync(async function (req, res, next) {
  if (req.cookies.jwt) {
    //Verify the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    //Check if the user is not deleted
    const reqUser = await users.findById(decoded.id);

    if (!reqUser) return next();

    //Check if the password has not changed
    if (reqUser.passwordIsChanged(decoded.iat)) {
      return next();
    }
    res.locals.user = reqUser;
    return next();
  }
  next();
});

//SignUp
exports.signUp = catchAsync(async function (req, res, next) {
  newUser = await users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    //! Delete this line
    role: req.body.role,
    passwordChange: req.body.passwordChange,
  });

  sendToken(res, 200, newUser);
});

//LogIn
exports.logIn = catchAsync(async function (req, res, next) {
  //Check for the user and password
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Email or Password missing', 400));

  //Find the user from document through the given email
  const user = await users.findOne({ email }).select('+password');

  //Check if the credidentials match
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  //Send Result if verification is successful
  sendToken(res, 200, user);
});

//Verify access
exports.verifyAccess = catchAsync(async function (req, res, next) {
  //Get the token,check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.toLowerCase().startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError('Your are not logged in', 401));

  //Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check if the user is not deleted
  const reqUser = await users.findById(decoded.id);

  if (!reqUser)
    return next(
      new AppError(
        'The user belonging to the token has already been deleted.',
        401
      )
    );

  //Check if the password has not changed
  if (reqUser.passwordIsChanged(decoded.iat)) {
    return next(
      new AppError('Password has been changed recently,Log In again!', 401)
    );
  }
  req.user = reqUser;
  next();
});

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this operation', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async function (req, res, next) {
  //Check for user via its email id
  const user = await users.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user exists with such email', 404));
  //Generate a password reset token
  const resetPassword = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Send to user via email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetPassword}`;
  const text = `Forgot your password? Tap on the link to send a PATCH request with new password and passwordConfirm to recover your account.${resetUrl}.If you haven't forgot your password,just ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset link',
      text,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent successfully',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Token not sent successfully', 500));
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //Check if there is a token and then encrypt it
  if (!req.params.token)
    return next(new AppError('Did not pass a reset token', 400));
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //Check if the token is valid or hasn't expired
  const user = await users.findOne({
    passwordResetToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token is invalid or expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //Update the passwordChange time
  //Send a login token to the user

  sendToken(res, 201, user);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  //Get the user via qurie,based on the req.user(the current user who is logged in)
  const user = await users.findById(req.user._id).select('+password');
  //Check if the entered password is correct
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('The enetered password is incorrect', 401));
  //Change the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //Log in and send a token
  sendToken(res, 201, user);
});
