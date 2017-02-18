import { ProfileDAO } from "../data/profile-dao";

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
  "use strict";

  const profile = new ProfileDAO(db);

  this.displayProfile = (req, res, next) => {
    const userId = req.session.userId;

    profile.getByUserId(parseInt(userId), (err, doc) => {
      if (err) return next(err);
      doc.userId = userId;

      return res.render("profile", doc);
    });
  };

  this.handleProfileUpdate = (req, res, next) => {

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const ssn = req.body.ssn;
    const dob = req.body.dob;
    const address = req.body.address;
    const bankAcc = req.body.bankAcc;
    const bankRouting = req.body.bankRouting;

    // Fix for Section: ReDoS attack
    // The following regexPattern that is used to validate the bankRouting number is insecure and vulnerable to
    // catastrophic backtracking which means that specific type of input may cause it to consume all CPU resources
    // with an exponential time until it completes
    // --
    // The Fix: Instead of using greedy quantifiers the same regex will work if we omit the second quantifier +
    // const regexPattern = /([0-9]+)\#/;
    const regexPattern = /([0-9]+)+\#/;
    // Allow only numbers with a suffix of the letter #, for example: 'XXXXXX#'
    const testComplyWithRequirements = regexPattern.test(bankRouting);
    // if the regex test fails we do not allow saving
    if (testComplyWithRequirements !== true) {
      return res.render("profile", {
          updateError: 'Bank Routing number does not comply with requirements for format specified'
        }
      )
    }

    const userId = req.session.userId;

    profile.updateUser(
      parseInt(userId),
      firstName,
      lastName,
      ssn,
      dob,
      address,
      bankAcc,
      bankRouting,
      (err, user) => {

        if (err) return next(err);

        // WARN: Applying any sting specific methods here w/o checking type of inputs could lead to DoS by HPP
        //firstName = firstName.trim();
        user.updateSuccess = true;
        user.userId = userId;

        return res.render("profile", user);
      }
    );

  };

}

module.exports = ProfileHandler;
