const { DataTypes } = require("sequelize");
const db = require("../utils/database");

const SerieGenres = db.define("serie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4 
  },
  serie_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'serie_id' 
  },
  genre_id: {
    type: DataTypes.INTEGER,  
    allowNull: false,
    field: 'genre_id'
  }
}, {
  tableName: 'serie_genres',
});

module.exports = SerieGenres;