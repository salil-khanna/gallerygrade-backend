import express from "express";
import User from "../models/user.js";
import Bookmarks from "../models/bookmarks.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import Reviews from "../models/reviews.js";


const router = express.Router();

const associatedAverageRatingFunction = async (users) => {
  const averageRatings = {};

  // Using map with Promise.all
  await Promise.all(users.map(async (user) => {
    const reviews = await Reviews.findAll({
      where: { username: user.username },
    });
    if (reviews.length === 0) {
      averageRatings[user.username] = 0;
      return;
    }
    // calulate average rating based on all their reviews, review.rating
    let sum = 0;
    reviews.forEach(review => {
      sum += review.rating;
    });
    const averageRating = sum / reviews.length;

    averageRatings[user.username] = averageRating;
  }));

  return averageRatings;
};

// Get 4 random users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["username", "favoriteArtStyle"],
      limit: 5,
      order: Sequelize.literal("rand()"),
    });

    const averageRatings = await associatedAverageRatingFunction(users);
    const consolidatedData = users.map(user => {
      const averageRating = averageRatings[user.username];
      return { ...user.toJSON(), averageRating: averageRating };
    });
    res.json(consolidatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.get("/all", async (req, res) => {
//   try {
//       const users = await User.findAll();
//       res.json(users);
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// });

// Get information about a specific user
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      attributes: ["aboutMe", "favoriteArtStyle"],
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:username/:user_id", async (req, res) => {
    try {
      const { username, user_id } = req.params;
      const user = await User.findOne({
        where: { username, user_id },
      });
  
      if (!user) {
        res.status(404).json({ error: "Profile not found. Logging out..." });
        return;
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      secretQuestion,
      secretAnswer,
      aboutMe,
      favoriteArtStyle,
    } = req.body;


    const user = await User.findOne({ where: { username } });

    if (user) {
      res.status(409).json({ error: "User already exists, please login or try different username" });
      return;
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecretAnswer = await bcrypt.hash(secretAnswer, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      secretQuestion,
      secretAnswer: hashedSecretAnswer,
      aboutMe,
      favoriteArtStyle,
    });

    res.status(201).json({
        user_id: newUser.user_id,
        username: newUser.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    res.status(200).json({ user_id: user.user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check secret question and answer
router.post("/secret-question", async (req, res) => {
  try {
    const { username, secretQuestion, secretAnswer } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (user.secretQuestion !== secretQuestion) {
      res.status(401).json({ error: "Incorrect secret question" });
      return;
    }

    const isSecretAnswerValid = await bcrypt.compare(
      secretAnswer,
      user.secretAnswer
    );

    if (!isSecretAnswerValid) {
      res.status(401).json({ error: "Incorrect secret answer" });
      return;
    }

    res.status(200).json({ user_id: user.user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.put("/reset-password", async (req, res) => {
  try {
    const { username, password, user_id } = req.body;
    const user = await User.findOne({ where: { username, user_id } });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedNewPassword });

    res.status(201).json({ user_id: user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset secret question
router.put("/update-user-info", async (req, res) => {
    try {
      const { username, user_id, password, secretQuestion, secretAnswer, aboutMe, favoriteArtStyle } = req.body;
      const user = await User.findOne({ where: { username, user_id } });
  
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      if (password !== '') {
        const hashedNewPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedNewPassword });
      }


      if (secretAnswer !== '') {
        const hashedNewSecretAnswer = await bcrypt.hash(secretAnswer, 10);
        await user.update({ secretQuestion: secretQuestion , secretAnswer: hashedNewSecretAnswer });
      }

      await user.update({aboutMe: aboutMe, favoriteArtStyle: favoriteArtStyle})
  
      res.status(201).json({ user_id: user_id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
// Delete user
router.delete("/", async (req, res) => {
    try {
      const { username, user_id } = req.body;

      const user = await User.findOne({ where: { username, user_id } });
  
      if (!user) {
        res.status(404).json({ error: "Profile not found, logging out..." });
        return;
      }

      await Bookmarks.destroy({ where: { user_id } });
      await Reviews.destroy({ where: { user_id } });
      await user.destroy();
      res.status(200).json({ message: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

export default router;

