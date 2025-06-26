const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const MovieGenres = db.define("movie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  movieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  genreId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'movie_genres'
});

module.exports = MovieGenres;
