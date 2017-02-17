import { MemosDAO } from "../data/memos-dao";

function MemosHandler(db) {
  "use strict";

  const memosDAO = new MemosDAO(db);

  this.addMemos = (req, res, next) => {
    memosDAO.insert(req.body.memo, (err, docs) => {
      if (err) return next(err);

      memosDAO.getAllMemos((err, memosList) => {
        if (err) return next(err);
        return res.render("memos", { memosList });
      });

    });
  };

  this.displayMemos = (req, res, next) => {
    memosDAO.getAllMemos((err, memosList) => {
      if (err) return next(err);
      return res.render("memos", { memosList });
    });
  };

}

module.exports = MemosHandler;
