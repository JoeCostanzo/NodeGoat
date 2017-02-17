'use strict';
import _ from "underscore";
import path from "path";

const finalEnv = process.env.NODE_ENV || "development";

const config = _.extend(
    require(path.resolve(__dirname + "/../config/env/all.js")),
    require(path.resolve(__dirname + "/../config/env/" + finalEnv.toLowerCase() + ".js") || {})
);

module.exports = config;