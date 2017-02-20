import { BenefitsDAO } from "../data/benefits-dao";

function BenefitsHandler(db) {
  "use strict";

  const benefitsDAO = new BenefitsDAO(db);

  this.displayBenefits = (req, res, next) => {

    benefitsDAO.getAllNonAdminUsers((error, users) => {
      if (error) return next(error);

      return res.render("benefits", {
        users,
        user: {isAdmin: true}
      });
    });
  };

  this.updateBenefits = (req, res, next) => {
    const userId = req.body.userId;
    const benefitStartDate = req.body.benefitStartDate;

    benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {
      if (error) return next(error);

      benefitsDAO.getAllNonAdminUsers((error, users) => {
        let data;

        if (error) return next(error);

        data = {
          users,
          user: {isAdmin: true},
          updateSuccess: true
        };

        return res.render("benefits", data);
      });
    });
  };
}

module.exports = BenefitsHandler;
