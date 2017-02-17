// Error handling middleware

const errorHandler = (error, req, res, next) => {
  "use strict";

  console.error(err.message);
  console.error(err.stack);
  res.status(500);
  res.render("error-template", {error});
};

exports.errorHandler = errorHandler;
