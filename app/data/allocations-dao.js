import { UserDAO } from "./user-dao";

/* The AllocationsDAO must be constructed with a connected database object */
function AllocationsDAO(db) {

  "use strict";

  /* If this constructor is called without the "new" operator, "this" points
   * to the global object. Log a warning and call it correctly. */
  if (false === (this instanceof AllocationsDAO)) {
    console.log("Warning: AllocationsDAO constructor called without 'new' operator");
    return new AllocationsDAO(db);
  }

  const allocationsCol = db.collection("allocations");
  const userDAO = new UserDAO(db);


  this.update = (userId, stocks, funds, bonds, callback) => {
    const finalId = parseInt(userId);

    // Create allocations document
    const allocations = {
      userId,
      stocks,
      funds,
      bonds
    };

    allocationsCol.update({
      userId: finalId
    }, allocations, {
      upsert: true
    }, (err, result) => {

      if (!err) {

        console.log("Updated allocations");

        userDAO.getUserById(userId, (err, user) => {

          if (err) return callback(err, null);

          // add user details
          allocations.userId = userId;
          allocations.userName = user.userName;
          allocations.firstName = user.firstName;
          allocations.lastName = user.lastName;

          return callback(null, allocations);
        });
      }

      return callback(err, null);
    });
  };

  // This is the good implementation, respect the last one
  this.getByUserId = (userId, callback) => {
    const finalId = parseInt(userId);

    allocationsCol.findOne({
      userId: finalId
    }, (err, allocations) => {
      if (err) return callback(err, null);
      if (!allocations) return callback("ERROR: No allocations found for the user", null);

      userDAO.getUserById(finalId, (err, user) => {
        if (err) return callback(err, null);

        // add user details
        allocations.userId = userId;
        allocations.userName = user.userName;
        allocations.firstName = user.firstName;
        allocations.lastName = user.lastName;

        callback(null, allocations);
      });

    });
  };

  this.getThresholdByUserId = (userId, threshold, callback) => {
    const finalId = parseInt(userId);

    /*
     // Fix for A1 - 2 NoSQL Injection - escape the threshold parameter properly
     Fix this SQL Injection which doesn't sanitze the input parameter 'threshold' and allows attackers
     to inject arbitrary javascript code into the NoSQL query:
     1. 0';while(true){}'
     2. 1'; return 1 == 1
     */
    const whereClause = `this.userId == '${finalId}' && this.stocks > '${threshold}'`;

    allocationsCol.findOne({
      $where: whereClause
    }, (err, allocations) => {

      if (err) return callback(err, null);
      if (!allocations) return callback("ERROR: No allocations found for the user", null);

      userDAO.getUserById(finalId, (err, user) => {
        if (err) return callback(err, null);

        // add user details
        allocations.userId = userId;
        allocations.userName = user.userName;
        allocations.firstName = user.firstName;
        allocations.lastName = user.lastName;

        callback(null, allocations);
      });

    });
  };
}

module.exports.AllocationsDAO = AllocationsDAO;
