const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const MovieGenres = db.define("movie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  movie_Id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  genre_Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'movie_genres'
});

module.exports = MovieGenres;
