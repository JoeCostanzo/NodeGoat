// Use crypto module to save sensitive data such as ssn, dob in encrypted format
import crypto from "crypto";
import path from "path";
import config from "./../../../dist/config/config";

/* The ProfileDAO must be constructed with a connected database object */
function ProfileDAO(db) {

  "use strict";

  /* If this constructor is called without the "new" operator, "this" points
   * to the global object. Log a warning and call it correctly. */
  if (false === (this instanceof ProfileDAO)) {
    console.log("Warning: ProfileDAO constructor called without 'new' operator");
    return new ProfileDAO(db);
  }

  const users = db.collection("users");

  // Fix for A6 - Sensitive Data Exposure

  // Helper function to encrypt data
  const encrypt = toEncrypt => {
    const cipher = crypto.createCipher(config.cryptoAlgo, config.cryptoKey);
    return cipher.update(toEncrypt, "utf8", "hex") + cipher.final("hex");
  };

  // Helper function to decrypt data
  const decrypt = toDecrypt => {
    const decipher = crypto.createDecipher(config.cryptoAlgo, config.cryptoKey);
    return decipher.update(toDecrypt, "hex", "utf8") + decipher.final("utf8");
  };


  this.updateUser = (
    userId,
    firstName,
    lastName,
    ssn,
    dob,
    address,
    bankAcc,
    bankRouting,
    callback
  ) => {

    // Create user document
    let user = {};
    firstName && (user.firstName = firstName);
    lastName && (user.lastName = lastName);
    address && (user.address = address);
    bankAcc && (user.bankAcc = bankAcc);
    bankRouting && (user.bankRouting = bankRouting);
    ssn && (user.ssn = ssn);
    dob && (user.dob = dob);
    /*
     // Fix for A7 - Sensitive Data Exposure
     // Store encrypted ssn and DOB
     if(ssn) {
     user.ssn = encrypt(ssn);
     }
     if(dob) {
     user.dob = encrypt(dob);
     }
     */

    users.update(
      {_id: parseInt(userId)},
      {$set: user},
      (err, result) => {
        if (!err) {
          console.log("Updated user profile");
          return callback(null, user);
        }

        return callback(err, null);
      }
    );
  };

  this.getByUserId = (userId, callback) => {
    users.findOne(
      {_id: parseInt(userId)},
      (err, user) => {
        if (err) return callback(err, null);
        /*
         // Fix for A7 - Sensitive Data Exposure
         // Decrypt ssn and DOB values to display to user
         user.ssn = user.ssn ? decrypt(user.ssn) : "";
         user.dob = user.dob ? decrypt(user.dob) : "";
         */

        callback(null, user);
      }
    );
  };
}

module.exports.ProfileDAO = ProfileDAO;
