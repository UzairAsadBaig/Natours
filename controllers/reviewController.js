const reviews = require('../models/reviewmodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setReviewUser = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReviews = factory.getAll(reviews);
exports.getReview = factory.getOne(reviews, null);
exports.createReview = factory.createOne(reviews);
exports.deleteReview = factory.deleteOne(reviews);
exports.updateReview = factory.updateOne(reviews);
