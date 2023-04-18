import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secretQuestion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secretAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aboutMe: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  favoriteArtStyle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default User;
