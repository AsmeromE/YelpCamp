const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = `${"pk.eyJ1IjoiYXNtZXN0aWYiLCJhIjoiY2xzZDc1djNyMDV2ZjJrbzR4ZGY0MWF5OSJ9.zOy1jrlCJ0Lq_tPkAPEQUQ"}`;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dcx6lxezh/image/upload/v1707144896/YelpCamp/plz27odqmeveifi9db1n.jpg",
          filename: "YelpCamp/plz27odqmeveifi9db1n",
        },
        {
          url: "https://res.cloudinary.com/dcx6lxezh/image/upload/v1707144896/YelpCamp/zs1ltrecitiicdcv63to.jpg",
          filename: "YelpCamp/zs1ltrecitiicdcv63to",
        },
        {
          url: "https://res.cloudinary.com/dcx6lxezh/image/upload/v1707144896/YelpCamp/hktqdyatemkyahiieily.jpg",
          filename: "YelpCamp/hktqdyatemkyahiieily",
        },
      ],
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore dolorum necessitatibus, optio quis tempore illum, ducimus consectetur debitis accusamus culpa repellat velit tenetur! Iste facilis voluptatem exercitationem consequatur corrupti animi.",
      price,
      author: "65990d11502d27e0d85c8c3a",
    });
    // const geoData = await geocoder
    //   .forwardGeocode({
    //     query: camp.location,
    //     limit: 1,
    //   })
    //   .send();
    // camp.geometry = geoData.body.features[0].geometry;
    await camp.save();
  }
};

seedDB().then(() => {
  db.close();
});
