// bookmark-controller.js

import express from "express";
import Art from "../models/art.js";
import Bookmarks from "../models/bookmarks.js";
import Sequelize from "sequelize";

const router = express.Router();

// Get 3 random bookmarks for a user
router.get("/random/:user_id/:username", async (req, res) => {
try {
    const { user_id, username } = req.params;
    const bookmarks = await Bookmarks.findAll({
      where: { user_id, username },
      include: Art,
      limit: 3,
      order: Sequelize.literal("rand()"),
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookmarks for a user
router.get("/:user_id/:username", async (req, res) => {
  try {
    const { user_id, username } = req.params;
    const bookmarks = await Bookmarks.findAll({
      where: { user_id, username },
      include: Art,
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a bookmark
router.post("/", async (req, res) => {
  try {
    const { art_id, user_id, username, image_url, image_title } = req.body;
    let art = await Art.findOne({ where: { art_id } });

    if (!art) {
      art = await Art.create({ art_id, image_url, image_title });
    }

    const existingBookmark = await Bookmarks.findOne({
      where: { art_id, user_id, username },
    });
    

    if (existingBookmark) {
      res.status(401).json({ error: "Bookmark already exists" });
      return;
    }

    await Bookmarks.create({ art_id, user_id, username });
    res.status(201).json({ message: "Bookmark added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a bookmark
router.delete("/", async (req, res) => {
  try {
    const { art_id, user_id, username } = req.body;

    const bookmark = await Bookmarks.findOne({
      where: { art_id, user_id, username },
    });

    if (!bookmark) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    await bookmark.destroy();
    res.status(200).json({ message: "Bookmark deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
