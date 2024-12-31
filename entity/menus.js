/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'menus',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      menusName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'menusName'
      },
      sitesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'sitesId'
      },
      url: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'url'
      },
      icon: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'icon'
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'parentId'
      },
      menuPositionsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'menuPositionsId'
      },
      orderBy: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'orderBy'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      urlSlugs: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'urlSlugs'
      },

      displayChild: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: 'displayChild'
      }
    },
    {
      tableName: 'menus',
      timestamps: false
    }
  );
};
