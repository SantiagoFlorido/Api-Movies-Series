const { DataTypes } = require("sequelize");
const uuid = require("uuid");

const db = require("../utils/database");

const MovieGenres = db.define("movie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4 
  },
  movie_id: { 
    type: DataTypes.UUID,
    allowNull: false,
    field: 'movie_id' 
  },
  genre_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'genre_id' 
  }
}, {
  tableName: 'movie_genres',
});

module.exports = MovieGenres;