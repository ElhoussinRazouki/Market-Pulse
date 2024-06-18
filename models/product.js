const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  price_min: Number,
  price_max: Number,
  shipping: String,
  link: String,
  image: String,
  category: String
});

module.exports = mongoose.model('Product', productSchema);
