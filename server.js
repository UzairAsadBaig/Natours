const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', function (err) {
  console.log(`${err.name} : ${err.message}`);
  console.log(`App is shutting down ......`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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

const server = app.listen(+process.env.PORT, '127.0.0.1', function () {
  console.log(`Server has started listening....`);
});

process.on('unhandledRejection', function (err) {
  console.log(`${err.name} : ${err.message}`);
  console.log(`App is shutting down ......`);
  server.close(function () {
    process.exit(1);
  });
});
