import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";

const router = express.Router();

// Get 4 random users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["username", "favoriteArtStyle"],
      limit: 4,
      order: Sequelize.literal("rand()"),
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get information about a specific user
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      attributes: ["aboutMe", "favoriteArtStyle"],
      where: { username },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:username/:id", async (req, res) => {
    const { username, id } = req.params;
  
    try {
      const user = await User.findOne({
        where: { username, id },
      });
  
      if (!user) {
        res.status(404).json({ error: "User not found" });
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
        id: newUser.id,
        username: newUser.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    res.status(200).json({ id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check secret question and answer
router.post("/secret-question", async (req, res) => {
  const { username, secretQuestion, secretAnswer } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
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

    res.status(200).json({ id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.put("/reset-password", async (req, res) => {
  const { username, secretQuestion, secretAnswer, newPassword, id } = req.body;

  try {
    const user = await User.findOne({ where: { username, id } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
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

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put("/", async (req, res) => {
    const {
      id,
      username,
      password,
      secretQuestion,
      secretAnswer,
      aboutMe,
      favoriteArtStyle,
    } = req.body;
  
    try {
      const user = await User.findOne({ where: { username, id } });
  
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedSecretAnswer = await bcrypt.hash(secretAnswer, 10);
  
      await user.update({
        password: hashedPassword,
        secretQuestion,
        secretAnswer: hashedSecretAnswer,
        aboutMe,
        favoriteArtStyle,
      });
  
      res.status(201).json({ message: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Delete user
router.delete("/", async (req, res) => {
    const { username, id } = req.body;
  
    try {
      const user = await User.findOne({ where: { username, id } });
  
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      await user.destroy();
      res.status(200).end({ message: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

export default router;

