const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Genres = db.define("genres", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  }
}, {
  tableName: 'genres'
});

module.exports = Genres;
