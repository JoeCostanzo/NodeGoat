import SessionHandler from "./session";
import ProfileHandler from "./profile";
import BenefitsHandler from "./benefits";
import ContributionsHandler from "./contributions";
import AllocationsHandler from "./allocations";
import MemosHandler from "./memos";

import {errorHandler} from "./error";

const exports = (app, db) => {

  "use strict";

  const sessionHandler = new SessionHandler(db);
  const profileHandler = new ProfileHandler(db);
  const benefitsHandler = new BenefitsHandler(db);
  const contributionsHandler = new ContributionsHandler(db);
  const allocationsHandler = new AllocationsHandler(db);
  const memosHandler = new MemosHandler(db);

  // Middleware to check if a user is logged in
  const isLoggedIn = sessionHandler.isLoggedInMiddleware;

  //Middleware to check if user has admin rights
  const isAdmin = sessionHandler.isAdminUserMiddleware;

  // The main page of the app
  app.get("/", sessionHandler.displayWelcomePage);

  // Login form
  app.get("/login", sessionHandler.displayLoginPage);
  app.post("/login", sessionHandler.handleLoginRequest);

  // Signup form
  app.get("/signup", sessionHandler.displaySignupPage);
  app.post("/signup", sessionHandler.handleSignup);

  // Logout page
  app.get("/logout", sessionHandler.displayLogoutPage);

  // The main page of the app
  app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

  // Profile page
  app.get("/profile", isLoggedIn, profileHandler.displayProfile);
  app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

  // Contributions Page
  app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
  app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

  // Benefits Page
  // app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
  // app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
  //Fix for A7 - checks user role to implement  Function Level Access Control
  app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
  app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);

  // Allocations Page
  app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);
  app.get("/allocations-threshold", isLoggedIn, allocationsHandler.displayAllocationsThreshold);

  // Memos Page
  app.get("/memos", isLoggedIn, memosHandler.displayMemos);
  // Handle redirect for learning resources link
  app.get("/learn", isLoggedIn, (req, res, next) => res.redirect(req.query.url)); // Insecure way to handle redirects by taking redirect url from query string

  app.post("/memos", isLoggedIn, memosHandler.addMemos);

  // Handle redirect for learning resources link
  app.get("/tutorial", (req, res, next) => res.render("tutorial/a1"));
  app.get("/tutorial/:page", (req, res, next) => res.render("tutorial/" + req.params.page));

  // Error handling middleware
  app.use(errorHandler);
};

module.exports = exports;
