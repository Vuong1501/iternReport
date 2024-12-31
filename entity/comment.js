module.exports = function (sequelize, DataTypes) {
    return sequelize.define('comment', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
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
    }, {
        tableName: 'comments',
        timestamps: false
    })
}