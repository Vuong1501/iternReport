// models/OrderDetail.js

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('orderDetail', {
        order_detail_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'order_detail_id'
        },
        order_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'order_id'
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'product_id'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'quantity'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'price'
        },
    }, {
        tableName: 'orderDetail',
        timestamps: false
    });
};
