module.exports = function (sequelize, DataTypes) {
    return sequelize.define('requestFriend', {
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
            field: 'user_send_id',
        },
        user_receive_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_receive_id',
        },
        // status: {
        //     type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        //     defaultValue: 'pending',
        //     field: 'status'
        // },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        }
    }, {
        tableName: 'requestFriend',
        timestamps: false
    });
};
