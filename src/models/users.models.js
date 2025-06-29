const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Users = db.define("users", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len:[2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len:[2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate:{
      isEmail: true,
    },
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'users'
});

module.exports = Users;
