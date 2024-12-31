/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'orders',
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                field: 'user_id'
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                field: 'total_amount'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'status'
            },
        },
        {
            tableName: 'orders',
            timestamps: false
        }
    );
};
