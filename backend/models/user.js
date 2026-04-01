const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { hashPassword } = require('../config/auth');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('administrateur', 'enseignant', 'comptable', 'secretaire'),
        defaultValue: 'secretaire'
    },
    telephone: {
        type: DataTypes.STRING(20)
    },
    avatar: {
        type: DataTypes.STRING(255)
    },
    statut: {
        type: DataTypes.ENUM('actif', 'inactif', 'suspendu'),
        defaultValue: 'actif'
    },
    derniere_connexion: {
        type: DataTypes.DATE
    },
    deux_facteur_actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'utilisateurs',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await hashPassword(user.password);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await hashPassword(user.password);
            }
        }
    }
});

module.exports = User;