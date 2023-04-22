import express from "express";
import Reviews from "../models/reviews.js";
import Art from "../models/art.js";

const router = express.Router();

// Get any random 3 reviews from table given user_id, username; also include properties from art.js
router.get("/random/:user_id/:username", async (req, res) => {
  try {
    const { user_id, username } = req.params;
    const randomReviews = await Reviews.findAll({
      where: { user_id, username },
      include: Art,
      limit: 3,
      order: Sequelize.literal("rand()"),
    });
    res.json(randomReviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews from table given user_id, username, include properties from art.js
router.get("/:user_id/:username", async (req, res) => {
  try {
    const { user_id, username } = req.params;
    const reviews = await Reviews.findAll({
      where: { user_id, username },
      include: Art,
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews for a specific art_id
router.get("/image/:art_id", async (req, res) => {
    try {
      const { art_id } = req.params;
      const reviews = await Reviews.findAll({
        where: { art_id },
        include: Art,
      });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Get all reviews in the table
router.get("/", async (req, res) => {
  try {
    const reviews = await Reviews.findAll({ include: Art });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post review
router.post("/", async (req, res) => {
  try {
    const { art_id, user_id, username, review, rating, image_url, image_title, date_time } = req.body;
      
    let art = await Art.findOne({ where: { art_id } });

    if (!art) {
      art = await Art.create({ art_id, image_url, image_title });
    }

    const existingReview = await Reviews.findOne({ where: { art_id, user_id, username } });
    const date_actual = new Date();
    if (existingReview) {
      // update the existing review
      await existingReview.update({ review, rating, date_time, date_actual });

      res.json(existingReview);
    } else {
      const newReview = await Reviews.create({ art_id, user_id, username, review, rating, date_time, date_actual });
      res.status(201).json(newReview);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
router.delete("/", async (req, res) => {
  try {
    const { art_id, user_id, username } = req.body;

    const review = await Reviews.findOne({ where: { art_id, user_id, username } });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    await review.destroy();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
