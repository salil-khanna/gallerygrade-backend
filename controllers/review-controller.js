import express from "express";
import Reviews from "../models/reviews.js";
import Art from "../models/art.js";
import Sequelize from "sequelize";
import Moderators from "../models/moderators.js";
import User from "../models/user.js";

const router = express.Router();

const associatedArtFunction = async (reviews) => {
  const associatedArt = {};

  // Using map with Promise.all
  await Promise.all(reviews.map(async (review) => {
    const art = await Art.findOne({
      where: { art_id: review.art_id },
    });
    associatedArt[review.art_id] = art;
  }));

  return associatedArt;
};

// Get any random 3 reviews from table given user_id, username; also include properties from art.js
router.get("/random/:user_id/:username", async (req, res) => {
  try {
    const { user_id, username } = req.params;
    const randomReviews = await Reviews.findAll({
      where: { user_id, username },
      limit: 3,
      order: Sequelize.literal("random()"),
      attributes: { exclude: ["user_id"] },
    });

    const associatedArt = await associatedArtFunction(randomReviews);
    const consolidatedData = randomReviews.map(review => {
      const art = associatedArt[review.art_id];
      return { ...review.toJSON(), art };
    });

    res.json(consolidatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews from table given user_id, username, include properties from art.js
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const reviews = await Reviews.findAll({
      where: { username },
      order: [["date_actual", "DESC"]],
      attributes: { exclude: ["user_id"] },
    });

    const associatedArt = await associatedArtFunction(reviews);
    const consolidatedData = reviews.map(review => {
      const art = associatedArt[review.art_id];
      return { ...review.toJSON(), art };
    });

    // calculate average rating of all reviews as new property
    const averageRating = consolidatedData.reduce((acc, review) => {
      return acc + review.rating;
    }, 0) / consolidatedData.length;

    res.json({consolidatedData, averageRating});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
// Get 5 most recent reviews in table, include properties from art.js
router.get("/", async (req, res) => {
  try {
    const reviews = await Reviews.findAll({
      limit: 6,
      order: [["date_actual", "DESC"]],
      attributes: { exclude: ["user_id"] },
    });

    const associatedArt = await associatedArtFunction(reviews);
    const consolidatedData = reviews.map(review => {
      const art = associatedArt[review.art_id];
      return { ...review.toJSON(), art };
    });

    res.json(consolidatedData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post review
router.post("/", async (req, res) => {
  try {
    const { art_id, user_id, username, review, rating, image_url, image_title, date_time } = req.body;

    // check that the user exists
    const user = await User.findOne({ where: { user_id, username } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }


      
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

    // check that the user exists
    const user = await User.findOne({ where: { user_id, username } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const review = await Reviews.findOne({ where: { art_id, user_id, username } });

    if (!review) {
      res.status(401).json({ error: "Review not found" });
      return;
    }

    await review.destroy();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review as mod
router.delete("/mod", async (req, res) => {
  try {
    const { art_id, review_id, user_id } = req.body;

    const review = await Reviews.findOne({ where: { art_id, review_id } });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // check if user is a moderator
    const moderator = await Moderators.findOne({ where: { user_id } });
    if (!moderator) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await review.destroy();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
