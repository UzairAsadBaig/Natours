const catchAsync = require('../utils/catchAsync');
const tours = require('../models/tourmodel');
const reviews = require('../models/reviewmodel');

exports.getOverview = catchAsync(async function (req, res) {
  //Get all tours
  const allTours = await tours.find();
  //Build template
  //Display all tours
  res.status(200).render('overview', {
    allTours,
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const tour = await tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = function (req, res) {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
