const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

router
  .route("/register")
  .get((req, res) => {
    res.render("users/register");
  })
  .post(
    catchAsync(async (req, res, next) => {
      try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
          if (err) return next(error);
          req.flash("success", "Welcome to Yelp Camp!");
          res.redirect("campgrounds");
        });
      } catch (e) {
        req.flash("error", e.message);
        res.render("users/register");
      }
    })
  );

router
  .route("/login")
  .get((req, res) => {
    res.render("users/login");
  })
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    (req, res) => {
      const redirectUrl = res.locals.returnTo || "/campgrounds";
      req.flash("success", "Welcome back!");
      res.redirect(redirectUrl);
    }
  );

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (!err) {
      req.flash("success", "Good bye!");
      res.redirect("campgrounds");
    }
  });
});

module.exports = router;
