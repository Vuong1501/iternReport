module.exports = function (sequelize, DataTypes) {
    return sequelize.define('message', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        user_send_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_send_id'
        },
        user_receive_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_receive_id'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_read'
        },
        read_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'read_at'
        },
    }, {
        tableName: 'message',
        timestamps: false
    })
}