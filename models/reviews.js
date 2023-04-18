import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Reviews = sequelize.define("Reviews", {
    review_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
  image_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
    review: {
    type: DataTypes.TEXT,
    },
    rating: {
    type: DataTypes.INTEGER,
    },
});

export default Reviews;