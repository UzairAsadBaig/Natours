const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIfeatures = require('../utils/apiFeature');

exports.deleteOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);
    if (!deletedDoc)
      return next(
        new AppError(`No document found with such id ${req.params.id}`, 404)
      );
    //! Not used by jonas
    res.status(200).json({
      status: 'success',
      message: 'Data successfully deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem)
      return next(
        new AppError(`No document found with such id ${req.params.id}`, 404)
      );
    res.status(201).json({
      status: 'success',
      Data: {
        updatedItem,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const newDoc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: newDoc,
    });
  });

exports.getOne = (Model, popParam) =>
  catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);
    if (popParam) query = query.populate(popParam);
    const doc = await query;
    if (!doc)
      return next(
        new AppError(`No document found with such id ${req.params.id}`, 404)
      );
    res.status(200).json({
      status: 'success',
      doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async function (req, res, next) {
    //Hack for nested routes in reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const doc = await feature.query;
    res.status(200).json({
      status: 'success',
      NumberOfDocs: doc.length,
      data: {
        doc,
      },
    });
  });
