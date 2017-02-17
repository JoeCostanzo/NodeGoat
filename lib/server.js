"use strict";

import express from "express";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
// import csrf from 'csurf';
import consolidate from "consolidate"; // Templating library adapter for Express
import swig from "swig";
// import helmet from "helmet";
import { MongoClient } from "mongodb"; // Driver for connecting to MongoDB
import http from "http";
import marked from 'marked';
//import helmet from "helmet";
//import nosniff from 'dont-sniff-mimetype';
const app = express(); // Web framework to handle routing requests
import routes from "./../dist/app/routes/index";
import config from "./config/config"; // Application config properties
/*
 // Fix for A6-Sensitive Data Exposure
 // Load keys for establishing secure HTTPS connection
 import fs from "fs";
 import https from "https";
 import path from "path";
 const httpsOptions = {
 key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
 cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt"))
 };
 */

MongoClient.connect(config.db, (err, db) => {
  if (err) {
    console.log("Error: DB: connect");
    console.log(err);

    process.exit(1);
  }
  console.log(`Connected to the database: ${config.db}`);

  // Remove default x-powered-by response header
  app.disable("x-powered-by");
  /*
   // Fix for A5 - Security MisConfig
   // TODO: Review the rest of helmet options, like "xssFilter"

   // Prevent opening page in frame or iframe to protect from clickjacking
   app.use(helmet.xframe());

   // Prevents browser from caching and storing page
   app.use(helmet.noCache());

   // Allow loading resources only from white-listed domains
   app.use(helmet.csp());

   // Allow communication only on HTTPS
   app.use(helmet.hsts());

   // TODO: Add another vuln: https://github.com/helmetjs/helmet/issues/26
   // Enable XSS filter in IE (On by default)
   // app.use(helmet.iexss());
   // Now it should be used in hit way, but the README alerts that could be
   // dangerous, like specified in the issue.
   // app.use(helmet.xssFilter({ setOnOldIE: true }));

   // Forces browser to only use the Content-Type set in the response header instead of sniffing or guessing it
   app.use(nosniff());
   */

  // Adding/ remove HTTP Headers for security
  app.use(favicon(__dirname + "./../app/assets/favicon.ico"));

  // Express middleware to populate "req.body" so we can access POST variables
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));// Mandatory in Express v4

  app.use(cookieParser());
  // Enable session management using express middleware
  app.use(session({
    // TODO: Add another vuln?
    // genid: function(req) {
    //    return genuuid() // use UUIDs for session IDs
    //},
    secret: config.cookieSecret,
    // Both mandatory in Express v4
    saveUninitialized: true,
    resave: true,
    /*
     // Fix for A5 - Security MisConfig
     // Use generic cookie name
     key: "sessionId",
     */
    // Fix for A3 - XSS
    cookie: {
      httpOnly: true,
      maxAge: config.maxAge
      // Remember to start an HTTPS server to get this working
      // secure: true
    }

  }));

  /*
   // Fix for A8 - CSRF
   // Enable Express csrf protection
   app.use(csrf());
   // Make csrf token available in templates
   app.use(function(req, res, next) {
   res.locals.csrftoken = req.csrfToken();
   next();
   });
   */

  // Register templating engine
  app.engine(".html", consolidate.swig);
  app.set("view engine", "html");
  app.set("views", __dirname + "./../app/views");
  app.use(express.static(__dirname + "./../app/assets"));


  // Initializing marked library
  // Fix for A9 - Insecure Dependencies
  marked.setOptions({sanitize: true});
  app.locals.marked = marked;

  // Application routes
  routes(app, db);

  // Template system setup
  swig.setDefaults({
    // Autoescape disabled
    autoescape: false
    /*
     // Fix for A3 - XSS, enable auto escaping
     autoescape: true // default value
     */
  });

  // Insecure HTTP connection
  http.createServer(app).listen(config.port, () => console.log(`Express http server listening on port ${config.port}`));

  // Fix for A6-Sensitive Data Exposure
  // Use secure HTTPS protocol
  // https.createServer(httpsOptions, app).listen(config.port, () =>console.log(`Express https server listening on port ${config.port}`));

});
