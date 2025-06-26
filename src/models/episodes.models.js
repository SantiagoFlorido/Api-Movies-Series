const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Episodes = db.define("episodes", {
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
    type: DataTypes.STRING,
    allowNull: true
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  episodeNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
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
  episodeUrl: {
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
  }
}, {
  tableName: 'episodes'
});

module.exports = Episodes;