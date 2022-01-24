const routes = require('express').Router();

const articles = require('./articles');
const users = require('./users');

routes.use('/', users);
routes.use('/', articles);

module.exports = routes;
