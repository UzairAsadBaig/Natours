const tours = require('../models/tourmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTop5Cheapest = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.field = 'name,difficulty,ratingsAverage,price,summary';
  next();
};

exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        numRating: { $sum: '$ratingsAverage' },
        numTours: { $sum: 1 },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
  const year = +req.params.year;
  const plans = await tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTour: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: plans,
  });
});

exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    next(
      new AppError(
        'Please provide longitude and lattitde in the format lat,lng',
        400
      )
    );
  const tour = await tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      data: tour,
    },
  });
});
exports.getDistances = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    next(
      new AppError(
        'Please provide longitude and lattitde in the format lat,lng',
        400
      )
    );
  const distances = await tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(tours);
exports.getTour = factory.getOne(tours, { path: 'reviews' });
exports.createTour = factory.createOne(tours);
exports.updateTour = factory.updateOne(tours);
exports.deleteTour = factory.deleteOne(tours);
