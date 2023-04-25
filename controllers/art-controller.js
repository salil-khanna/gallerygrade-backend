import express from "express";
import Art from "../models/art.js";
import Reviews from "../models/reviews.js";
import Bookmarks from "../models/bookmarks.js";
import { Op } from "sequelize";
import axios from "axios"

const router = express.Router();

// Get art by ID with reviews and optional bookmark information
router.get("/:art_id/:user_id?", async (req, res) => {
  try {
    const { art_id, user_id } = req.params;

    // Fetch art details from the Art Institute API
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks/${art_id}?fields=id,title,artist_display,image_id,department_title,medium_display,thumbnail,date_start,date_end`);
    const art = {
      "art_info": response.data.data,
      "image_url": response.data.config.iiif_url,
    };


    // Fetch all reviews for the given art
    const reviews = await Reviews.findAll({
      where: { art_id },
      attributes: ["username", "review", "rating", "date_time", "review_id"],
      order: [['date_actual', 'DESC']],
    });

    // calculate average rating by looking at all reviews
    let averageRating = 0;
    let totalRating = 0;
    let totalReviews = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
      totalReviews += 1;
    });
    if (totalReviews !== 0) {
      averageRating = totalRating / totalReviews;
    }

    // Check if the art is bookmarked by the user
    let isBookmarked = false;
    if (user_id) {
      const bookmark = await Bookmarks.findOne({ where: { art_id, user_id } });
      isBookmarked = !!bookmark;
    }

    // Return the art details, reviews, and bookmark information
    res.json({
      art,
      galleryInfo: {
        reviews,
        isBookmarked,
        averageRating,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
