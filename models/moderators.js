import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Moderators = sequelize.define("Moderators", {
  moderator_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default Moderators;
