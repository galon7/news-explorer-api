const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../middlewares/errors');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new Error();
      }
      res.send(user);
    }).catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => {
      if (!user) {
        throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, please check your data');
      }
      User.findOne(user).then((userSafe) => res.status(StatusCodes.CREATED).send(userSafe));
    }).catch((err) => {
      if (err.code === 11000) throw new ErrorHandler(StatusCodes.CONFLICT, 'Error, please check your data');
      else next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new ErrorHandler(StatusCodes.UNAUTHORIZED, 'Error, please check your data');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};
