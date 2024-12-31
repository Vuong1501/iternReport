module.exports = function (sequelize, DataTypes) {
    return sequelize.define('friend', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        user1_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user1_id'
        },
        user2_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user2_id'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        last_message_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_message_at'
        }
    }, {
        tableName: 'friend',
        timestamps: false
    });
};
