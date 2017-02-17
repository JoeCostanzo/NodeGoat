import bcrypt from "bcrypt-nodejs";
const saltRounds = 10;

/* The UserDAO must be constructed with a connected database object */
function UserDAO(db) {
  "use strict";

  /* If this constructor is called without the "new" operator, "this" points
   * to the global object. Log a warning and call it correctly. */
  if (false === (this instanceof UserDAO)) {
    console.log("Warning: UserDAO constructor called without 'new' operator");
    return new UserDAO(db);
  }

  const usersCol = db.collection("users");

  this.addUser = (
    userName,
    firstName,
    lastName,
    plainTextPassword,
    email,
    callback
  ) => {
    // Fix for A2-1 - Broken Auth
    // Stores password in a safer way using one way encryption and salt hashing
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return callback(err, null);

      bcrypt.hash(plainTextPassword, salt, null, (err, hash) => {
        if (err) return callback(err, null);

        // Create user document
        const user = {
          userName: userName,
          firstName: firstName,
          lastName: lastName,
          benefitStartDate: this.getRandomFutureDate(),
          password: hash
        };

        // Add email if set
        email !== "" && (user.email = email);

        this.getNextSequence("userId", (err, id) => {
          if (err) return callback(err, null);
          console.log(typeof(id));

          user._id = id;

          usersCol.insert(user, (err, result) => {

            if (!err) return callback(null, result.ops[0]);

            return callback(err, null);
          });
        });
      });

    });
  };

  this.getRandomFutureDate = () => {
    const today = new Date();
    const day = (Math.floor(Math.random() * 10) + today.getDay()) % 29;
    const month = (Math.floor(Math.random() * 10) + today.getMonth()) % 12;
    const year = Math.ceil(Math.random() * 30) + today.getFullYear();
    return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`;
  };

  this.validateLogin = (userName, plainTextPassword, callback) => {

    // Callback to pass to MongoDB that validates a user document
    function validateUserDoc(err, user) {

      if (err) return callback(err, null);

      if (user) {
        if (comparePassword(plainTextPassword, user.password)) {
          callback(null, user);
        } else {
          let invalidPasswordError = new Error("Invalid password");
          // Set an extra field so we can distinguish this from a db error
          invalidPasswordError.invalidPassword = true;
          callback(invalidPasswordError, null);
        }
      } else {
        const noSuchUserError = new Error("User: " + user + " does not exist");
        // Set an extra field so we can distinguish this from a db error
        noSuchUserError.noSuchUser = true;
        callback(noSuchUserError, null);
      }
    }

    // Helper function to compare passwords
    function comparePassword(fromDB, fromUser) {

      // Fix for A2-Broken Auth
      // compares decrypted password stored in this.addUser()
      return bcrypt.compareSync(fromDB, fromUser);
    }

    usersCol.findOne({ userName }, validateUserDoc);
  };

  // This is the good one, see the next function
  this.getUserById = (userId, callback) => usersCol.findOne({_id: parseInt(userId)}, callback);

  this.getUserByUserName = (userName, callback) => usersCol.findOne({ userName }, callback);

  this.getNextSequence = (name, callback) => {
    db.collection("counters").findAndModify(
      {_id: name},
      [],
      {$inc: {seq: 1}},
      {new: true},
      (err, data) => {
        if (err) return callback(err, null);
        callback(null, data.value.seq);
      }
    );
  };
}

module.exports.UserDAO = UserDAO;
