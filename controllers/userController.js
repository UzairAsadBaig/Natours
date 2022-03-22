const users = require('../models/usermodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObjects = function (object, ...allOptions) {
  const newObject = {};
  Object.keys(object).forEach((el) => {
    if (allOptions.includes(el)) newObject[el] = object[el];
  });
  return newObject;
};

//Update email and Username
exports.updateMe = catchAsync(async function (req, res, next) {
  //Check if the user is demanding change in password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route cannot be used to change password', 400)
    );
  //Get the user
  const filteredObjects = filterObjects(req.body, 'name', 'email');
  console.log({ filteredObjects });
  const user = await users.findByIdAndUpdate(req.user._id, filteredObjects, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async function (req, res, next) {
  await users.findByIdAndDelete(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createuser = function (req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Data successfully uploaded',
  });
};

exports.getMe = function (req, res, next) {
  req.params.id = req.user._id;
  next();
};

exports.getuser = factory.getOne(users);
exports.getAllusers = factory.getAll(users);
exports.updateuser = factory.updateOne(users);
exports.deleteuser = factory.deleteOne(users);
