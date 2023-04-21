import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Art = sequelize.define("Art", {
  art_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
    image_title: {
    type: DataTypes.STRING,
    allowNull: false,
    },
});

export default Art;
