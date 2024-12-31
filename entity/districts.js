/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'districts',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      districtName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'districtName'
      },
      provincesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'provincesId'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      value: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'value'
      }
    },
    {
      tableName: 'districts',
      timestamps: false
    }
  );
};
