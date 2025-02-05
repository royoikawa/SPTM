const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("about", { title: "關於我們" });
});

module.exports = router;