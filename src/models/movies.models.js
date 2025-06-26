const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Movies = db.define("movies", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1878 // primer año de cine
    }
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1
    }
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  coverUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  movieUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  classification: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 50]
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
      max: 10
    }
  }
}, {
  tableName: 'movies'
});

module.exports = Movies;
