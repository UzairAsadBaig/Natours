const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const tours = require('./models/tourmodel');
const users = require('./models/usermodel');
const reviews = require('./models/reviewmodel');
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('Database is connected...'));

const importData = async function (model, data) {
  try {
    await model.create(data, { validateBeforeSave: false });
    console.log('Uploaded');
  } catch (err) {
    console.log('error ariya hai validation ka');
  } finally {
    process.exit();
  }
};

const deleteData = async function (model) {
  try {
    await model.deleteMany();
    console.log('Deleted');
  } catch (err) {
    console.log('error ariya hai validation ka');
  } finally {
    process.exit();
  }
};

const toursData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8')
);
const usersData = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);
const reviewsData = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

if (process.argv[2] === '--import') {
  importData(users, usersData);
} else if (process.argv[2] === '--delete') {
  deleteData(users);
}
