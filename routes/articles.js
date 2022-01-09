const router = require('express').Router();

const { validateParam, validateArticle } = require('../middlewares/validations');

const {
  getArticles, createArticle, deleteArticle,
} = require('../controllers/articles');

router.get('/articles', getArticles);

router.post('/articles', validateArticle, createArticle);

router.delete('/articles/:articleId', validateParam, deleteArticle);

module.exports = router;
