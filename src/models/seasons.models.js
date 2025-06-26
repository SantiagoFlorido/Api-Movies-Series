const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Seasons = db.define("seasons", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  serieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  seasonNumber: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1878
    }
  },
  coverUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  tableName: 'seasons'
});

module.exports = Seasons;
