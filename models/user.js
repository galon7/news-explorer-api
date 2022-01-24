const isEmail = require('validator/lib/isEmail');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../middlewares/errors');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    validate: {
      validator(usrEmail) {
        return isEmail(usrEmail);
      },
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password,
) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new ErrorHandler(
            StatusCodes.UNAUTHORIZED,
            'Incorrect email or password',
          ),
        );
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new ErrorHandler(
              StatusCodes.UNAUTHORIZED,
              'Incorrect email or password',
            ),
          );
        }

        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
