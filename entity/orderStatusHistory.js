

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'orderStatusHistory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
                field: 'id'
            },
            order_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                field: 'order_id'
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'status'
            },
            changed_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'changed_at'
            },
        },
        {
            tableName: 'orderstatushistory',
            timestamps: false
        }
    )
}