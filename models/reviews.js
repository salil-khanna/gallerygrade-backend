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
  art_id: {
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
    allowNull: false,
    },
    date_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_actual: {
      type: DataTypes.DATE,
      allowNull: false,
    }
});

export default Reviews;