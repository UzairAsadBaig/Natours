const express = require('express');
const Router = express.Router();
const tourController = require('../controllers/tourController');
const reviewRoutes = require('./reviewRoutes');
const authController = require('../controllers/authController');
// Router.param('id', tourController.checkID);

//Nested Routes
Router.use('/:tourId/reviews', reviewRoutes);

//Providing Alias in routes
Router.route('/top-5-cheap').get(
  tourController.aliasTop5Cheapest,
  tourController.getAllTours
);

//Get tours near your area
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin
);
//Get distance of tours
Router.route('/distances/center/:latlng/unit/:unit').get(
  tourController.getDistances
);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.verifyAccess,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.verifyAccess,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.verifyAccess,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.verifyAccess,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
