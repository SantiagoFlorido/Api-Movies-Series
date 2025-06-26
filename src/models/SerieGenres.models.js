const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const SerieGenres = db.define("serie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  serieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  genreId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'serie_genres'
});

module.exports = SerieGenres;
