'use strict';
// default app configuration
module.exports = {
  port: process.env.PORT || 4000,
  db: process.env.MONGOLAB_URI || process.env.MONGODB_URI || "mongodb://nodegoat:owasp@ds159217.mlab.com:59217/nodegoat",
  cookieSecret: "not the generic cookie secret key used in all node goat instances",
  cryptoKey: "not the generic crpyto key used in all node goat instances",
  maxAge: 30 * 60 * 1000,
  cryptoAlgo: "aes256",
  hostName: "localhost"
};
