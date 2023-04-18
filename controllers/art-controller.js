import express from "express";
import Art from "../models/art.js";
import Reviews from "../models/reviews.js";
import Bookmarks from "../models/bookmarks.js";
import { Op } from "sequelize";

const router = express.Router();

// Get art by ID with reviews and optional bookmark information
router.get("/:image_id/:user_id?", async (req, res) => {
  try {
    const { image_id, user_id } = req.params;

    // Fetch art details
    const art = await Art.findByPk(image_id);
    if (!art) {
      res.status(404).json({ error: "Art not found" });
      return;
    }

    // Fetch all reviews for the given art
    const reviews = await Reviews.findAll({
      where: { image_id },
      attributes: ["username", "review", "rating"],
    });

    // Check if the art is bookmarked by the user
    let isBookmarked = false;
    if (user_id) {
      const bookmark = await Bookmarks.findOne({ where: { image_id, user_id } });
      isBookmarked = !!bookmark;
    }

    // Return the art details, reviews, and bookmark information
    res.json({
      art,
      reviews,
      isBookmarked,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
