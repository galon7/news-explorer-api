const errorsHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message,
      // message: statusCode === 500
      //   ? 'An error occurred on the server'
      //   : message,
    });
};

module.exports = { errorsHandler };
