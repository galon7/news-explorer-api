const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../middlewares/errors');

const Article = require('../models/article');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => {
      if (!articles) {
        throw new Error();
      }
      res.status(StatusCodes.OK).send(articles);
    })
    .catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Article.create({ name, link, owner })
    .then((article) => {
      if (!article) {
        throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, please check your data');
      }
      res.status(StatusCodes.CREATED).send(article);
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.find({ _id: req.params.articleId })
    .then((articleFound) => {
      if (!articleFound) {
        throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, article not found');
      }
      const articleFoundOwner = articleFound[0].owner.valueOf();
      if (articleFoundOwner === req.user._id) {
        Article.findByIdAndRemove(req.params.articleId)
          .then((article) => {
            if (!article) {
              throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, article not found');
            }
            res.status(StatusCodes.OK).send(article);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
            }
            next(err);
          })
          .catch(next);
      } else {
        throw new ErrorHandler(StatusCodes.UNAUTHORIZED, 'Authorization required');
      }
    }).catch(next);
};
