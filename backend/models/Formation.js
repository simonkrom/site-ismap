const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Formation = sequelize.define('Formation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        unique: true
    },
    titre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    categorie: {
        type: DataTypes.ENUM('licence', 'master', 'professionnelle'),
        allowNull: false
    },
    duree: {
        type: DataTypes.STRING(50)
    },
    description: {
        type: DataTypes.TEXT
    },
    prerequis: {
        type: DataTypes.TEXT
    },
    debouches: {
        type: DataTypes.TEXT
    },
    frais_inscription: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    frais_scolarite: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    frais_dossier: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 25000
    },
    image: {
        type: DataTypes.STRING(255)
    },
    statut: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'formations',
    timestamps: true,
    underscored: true
});

module.exports = Formation;