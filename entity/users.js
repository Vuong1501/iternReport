/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'username'
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'password'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'fullname'
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      // dateExpire: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      //   field: 'dateExpire'
      // },
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );
};
