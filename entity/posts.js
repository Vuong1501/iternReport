module.exports = function (sequelize, DataTypes) {
    return sequelize.define('post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
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
        visibility: {
            type: DataTypes.ENUM('public', 'friends', 'private'),
            allowNull: false,
            field: 'visibility'
        },
        count_like: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'count_like'
        },
        count_comment: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'count_comment'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
            onUpdate: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        tableName: 'posts',
        timestamps: false
    });
};
