const mongoose = require('mongoose');
const tours = require('./tourmodel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'You cant post an empty review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'tours',
      required: [true, 'A review must belong to some tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'A review must belong to some user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Populating user
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

//Calculating ratingsAverage and ratingsQuanitity
reviewSchema.statics.calAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: 'tour',
        ravg: { $avg: '$rating' },
        rquan: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await tours.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ravg,
      ratingsQuantity: stats[0].rquan,
    });
  } else {
    await tours.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

//Ratings will be updated when a new review is created
reviewSchema.post('save', function () {
  this.constructor.calAverageRating(this.tour);
});

//Rating is updated when a review is updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, function () {
  this.rev.constructor.calAverageRating(this.rev.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const reviews = mongoose.model('reviews', reviewSchema);
module.exports = reviews;
