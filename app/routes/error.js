// Error handling middleware

const errorHandler = (error, req, res, next) => {
  "use strict";

  console.error(error.message);
  console.error(error.stack);
  res.status(500);
  res.render("error-template", {error});
};

exports.errorHandler = errorHandler;
