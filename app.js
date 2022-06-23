const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const {
  MONGODB_URI, PORT = 3000,
} = process.env;
const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const { limiter } = require('./middlewares/rate-limiter');
const { validateUserLogin } = require('./middlewares/validations');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errorsHandler } = require('./middlewares/error-handler');
const auth = require('./middlewares/auth');

const app = express();
const routes = require('./routes/index');

app.use(requestLogger);
app.use(limiter);
app.use(helmet());

mongoose.connect(MONGODB_URI)
  // .connect(
  //   NODE_ENV === 'production'
  //     ? MONGODB_URI
  //     : MDB_ADDRESS,
  // )
  .then(console.log('Connected to DB'))
  .catch((err) => console.log(`DB connection error: ${err}`));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.post('/signin', validateUserLogin, login);
app.post('/signup', validateUserLogin, createUser);

app.use(auth);

app.use('/', routes);

app.use(errorLogger);

app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
