const express = require('express');
const router = express.Router();
const Product = require("../models/product");
const db = require('monk')('localhost:27017/Ebay');
const collection = db.get('Products');

router.get("/search", async (req, res) => {
  const query = req.query.q || '';
  if (query.trim() === '') {
    try {
      const products = await collection.find().limit(20);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    const regex = new RegExp(query, 'i');
    try {
      const products = await collection.find({
        $or: [
          { category: regex },
          { title: regex }
        ]
      });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.get("/filter", async (req, res) => {
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
  const categories = req.query.categories ? req.query.categories.split(',') : [];
  const query = req.query.q || '';

  let filter = {};

  if (query.trim() !== '') {
    const regex = new RegExp(query, 'i');
    filter.$or = [
      { category: regex },
      { title: regex },
    ];
  }

  if (!isNaN(minPrice) && !isNaN(maxPrice)) {
    filter.price_min = { $gte: minPrice };
    filter.price_max = { $lte: maxPrice };
  }

  if (categories.length > 0 && categories[0] !== '') {
    filter.category = { $in: categories };
  }

  try {
    const products = await collection.find(filter);
    res.render("search_results", { products: products, category: req.query.categories || '' });
  } catch (err) {
    console.error("Error while filtering products:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const products = await collection.find({ category: category });
    res.render("products", { products: products, category: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/", async (req, res) => {
  try {
    const price_min = parseFloat(req.query.price_min) || 0;
    let products = [];
    if (price_min) {
      products = await collection.find({ price_min: { $lt: price_min } });
    } else {
      products = await collection.find();
    }
    res.render("home", { products: products.slice(0, 20) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
