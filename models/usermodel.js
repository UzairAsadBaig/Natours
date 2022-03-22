const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Valid email is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-tour-guide', 'tour-guide'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Valid password is required'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password is not valid',
    },
  },
  passwordChange: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// userSchema.pre('save', async function (next) {
//   //   Return if password is not changed
//   if (!this.isModified('password')) return next();
//   // Encrypt the password with CPU Intensivenss set to 12
//   this.password = await bcrypt.hash(this.password, 12);
//   //Ignore passwordConfirm, as it should only be used at the time of creating the file
//   this.passwordConfirm = undefined;
// });

// userSchema.pre('save', async function (next) {
//   //   Return if password is not changed
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChange = Date.now() - 1000;
//   next();
// });

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

userSchema.methods.checkPassword = async function (enterdPass, userPass) {
  return await bcrypt.compare(enterdPass, userPass);
};
userSchema.methods.passwordIsChanged = function (jwtTime) {
  if (this.passwordChange) {
    const timeInSeconds = parseInt(this.passwordChange.getTime() / 1000, 10);
    return jwtTime < timeInSeconds;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  //Generating token
  const resetToken = crypto.randomBytes(32).toString('hex');
  //Encrypting it so it can be saved in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //Setting token expiry
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  //Returning token that is to be used
  return resetToken;
};

const users = mongoose.model('users', userSchema);
module.exports = users;
