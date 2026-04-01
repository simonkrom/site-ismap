const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Formation = require('./Formation');

const Etudiant = sequelize.define('Etudiant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matricule: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    num_dossier: {
        type: DataTypes.STRING(50)
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
        unique: true,
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
    formation_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'formations',
            key: 'id'
        }
    },
    annee_etude: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    date_inscription: {
        type: DataTypes.DATEONLY
    },
    situation_familiale: {
        type: DataTypes.ENUM('celibataire', 'marie', 'divorce', 'veuf'),
        defaultValue: 'celibataire'
    },
    contact_urgence_nom: {
        type: DataTypes.STRING(100)
    },
    contact_urgence_telephone: {
        type: DataTypes.STRING(20)
    },
    lien_parente: {
        type: DataTypes.STRING(50)
    },
    handicap: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    handicap_details: {
        type: DataTypes.TEXT
    },
    logement: {
        type: DataTypes.ENUM('familial', 'individuel', 'colocation', 'cite'),
        defaultValue: 'familial'
    },
    prise_en_charge: {
        type: DataTypes.ENUM('famille', 'personnelle', 'bourse', 'employeur'),
        defaultValue: 'famille'
    },
    bourse: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    type_bourse: {
        type: DataTypes.STRING(100)
    },
    mode_paiement: {
        type: DataTypes.ENUM('comptant', 'echelonne', 'mensuel'),
        defaultValue: 'comptant'
    },
    photo: {
        type: DataTypes.STRING(255)
    },
    statut: {
        type: DataTypes.ENUM('actif', 'suspendu', 'diplome', 'exclu'),
        defaultValue: 'actif'
    }
}, {
    tableName: 'etudiants',
    timestamps: true,
    underscored: true
});

// Relations
Etudiant.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

module.exports = Etudiant;