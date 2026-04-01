const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Formation = require('./Formation');

const Candidat = sequelize.define('Candidat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    num_dossier: {
        type: DataTypes.STRING(50),
        unique: true
    },
    civilite: {
        type: DataTypes.ENUM('M', 'Mme', 'Mlle'),
        allowNull: false
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    date_naissance: {
        type: DataTypes.DATEONLY
    },
    lieu_naissance: {
        type: DataTypes.STRING(100)
    },
    nationalite: {
        type: DataTypes.STRING(50),
        defaultValue: 'Gabonaise'
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    adresse: {
        type: DataTypes.TEXT
    },
    ville: {
        type: DataTypes.STRING(100)
    },
    code_postal: {
        type: DataTypes.STRING(20)
    },
    pays: {
        type: DataTypes.STRING(50),
        defaultValue: 'Gabon'
    },
    niveau_etudes: {
        type: DataTypes.STRING(50)
    },
    dernier_diplome: {
        type: DataTypes.STRING(100)
    },
    annee_obtention: {
        type: DataTypes.INTEGER
    },
    etablissement_origine: {
        type: DataTypes.STRING(200)
    },
    formation_choisie_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'formations',
            key: 'id'
        }
    },
    annee_inscription: {
        type: DataTypes.STRING(20)
    },
    regime: {
        type: DataTypes.ENUM('temps_plein', 'alternance', 'soir'),
        defaultValue: 'temps_plein'
    },
    documents_diplome: {
        type: DataTypes.STRING(255)
    },
    documents_cin: {
        type: DataTypes.STRING(255)
    },
    documents_photo: {
        type: DataTypes.STRING(255)
    },
    documents_cv: {
        type: DataTypes.STRING(255)
    },
    documents_lettre: {
        type: DataTypes.STRING(255)
    },
    statut: {
        type: DataTypes.ENUM('pending', 'reviewed', 'interview', 'accepted', 'rejected'),
        defaultValue: 'pending'
    },
    notes_commission: {
        type: DataTypes.TEXT
    },
    date_entretien: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'candidats',
    timestamps: true,
    underscored: true
});

// Relations
Candidat.belongsTo(Formation, { foreignKey: 'formation_choisie_id', as: 'formation' });

module.exports = Candidat;