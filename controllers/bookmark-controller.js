// bookmark-controller.js

import express from "express";
import Art from "../models/art.js";
import Bookmarks from "../models/bookmarks.js";
import Sequelize from "sequelize";
import User from "../models/user.js";

const router = express.Router();

const associatedArtFunction = async (bookmarks) => {
  const associatedArt = {};

  // Using map with Promise.all
  await Promise.all(bookmarks.map(async (bookmark) => {
    const art = await Art.findOne({
      where: { art_id: bookmark.art_id },
    });
    associatedArt[bookmark.art_id] = art;
  }));

  return associatedArt;
};


// Get 3 random bookmarks for a user
router.get("/random/:user_id/:username", async (req, res) => {
try {
    const { user_id, username } = req.params;
    const bookmarks = await Bookmarks.findAll({
      where: { user_id, username },
      attributes: ["art_id", "bookmark_id"],
      limit: 3,
      order: Sequelize.literal("rand()"),
    });
    const associatedArt = await associatedArtFunction(bookmarks);

    const consolidatedData = bookmarks.map(bookmark => {
      const art = associatedArt[bookmark.art_id];
      return { ...bookmark.toJSON(), art };
    });

    res.json(consolidatedData);
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
      // only include art_id, bookmark_id
      attributes: ["art_id", "bookmark_id"],
    });

    const associatedArt = await associatedArtFunction(bookmarks);
    const consolidatedData = bookmarks.map(bookmark => {
      const art = associatedArt[bookmark.art_id];
      return { ...bookmark.toJSON(), art };
    });

    res.json(consolidatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a bookmark
router.post("/", async (req, res) => {
  try {
    const { art_id, user_id, username, image_url, image_title } = req.body;
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

    // check that the user exists
    const user = await User.findOne({ where: { user_id, username } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const bookmark = await Bookmarks.findOne({
      where: { art_id, user_id, username },
    });

    if (!bookmark) {
      res.status(401).json({ error: "Bookmark not found" });
      return;
    }

    await bookmark.destroy();
    res.status(200).json({ message: "Bookmark deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
