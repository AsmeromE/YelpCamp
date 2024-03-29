const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campgrounds = new Campground(req.body.campground);
  campgrounds.geometry = geoData.body.features[0].geometry;
  campgrounds.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campgrounds.author = req.user._id;
  await campgrounds.save();
  console.log(campgrounds);
  req.flash("success", "Successfully created a campground");
  res.redirect(`/campgrounds/${campgrounds._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const campgrounds = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campgrounds) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campgrounds });
};

module.exports.renderEditForm = async (req, res, next) => {
  const campgrounds = await Campground.findById(req.params.id);
  if (!campgrounds) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campgrounds });
};

module.exports.updateCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campgrounds = await Campground.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body.campground,
    },
    { new: true }
  );
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campgrounds.images.push(...imgs);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campgrounds.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  campgrounds.geometry = geoData.body.features[0].geometry;
  await campgrounds.save();
  req.flash("success", "Successfully edited a campground");
  res.redirect(`/campgrounds/${campgrounds._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted a campground");
  res.redirect("/campgrounds");
};
