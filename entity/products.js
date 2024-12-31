

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('products', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        productName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'productName'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            field: 'price'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'quantity'
        },
        status: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'status'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'createdAt'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updatedAt'
        }
    }, {
        tableName: 'products',
        timestamps: false
    });
};
