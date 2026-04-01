const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'utilisateurs',
            key: 'id'
        }
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    revoked_at: {
        type: DataTypes.DATE
    },
    revoked_by_ip: {
        type: DataTypes.STRING(45)
    },
    user_agent: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['expires_at']
        }
    ]
});

// Relation
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = RefreshToken;