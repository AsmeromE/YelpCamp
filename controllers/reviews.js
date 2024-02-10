const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReviews = async (req, res, next) => {
  const campgrounds = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campgrounds.reviews.push(review);
  await campgrounds.save();
  await review.save();
  res.redirect(`/campgrounds/${campgrounds._id}`);
};
