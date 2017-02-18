import { AllocationsDAO } from "../data/allocations-dao";

function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        // Fix for A4 Insecure DOR -  take user id from session instead of from URL param
        const userId = req.session.userId;

        allocationsDAO.getByUserId(userId, (err, docs) => {
            if (err) return next(err);

            docs.userId = userId; //set for nav menu items

            return res.render("allocations", docs);
        });
    };

    this.displayAllocationsThreshold = (req, res, next) => {

        const userId = req.session.userId;
        const threshold = req.query.threshold || 0;

        allocationsDAO.getThresholdByUserId(userId, threshold, (err, docs) => {

            if (err) return next(err);

            docs.userId = userId; //set for nav menu items

            return res.render("allocations", docs);
        });
    };
}

module.exports = AllocationsHandler;
