import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Bookmarks = sequelize.define("Bookmarks", {
    bookmark_id : {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
  art_id: {
    type: DataTypes.INTEGER,
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
});

export default Bookmarks;
