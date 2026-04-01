const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Etudiant = require('./Etudiant');
const Formation = require('./Formation');
const User = require('./user');

const Paiement = sequelize.define('Paiement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reference: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    etudiant_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'etudiants',
            key: 'id'
        }
    },
    formation_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'formations',
            key: 'id'
        }
    },
    montant: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    frais_inscription: {
        type: DataTypes.DECIMAL(15, 2)
    },
    frais_scolarite: {
        type: DataTypes.DECIMAL(15, 2)
    },
    frais_dossier: {
        type: DataTypes.DECIMAL(15, 2)
    },
    methode: {
        type: DataTypes.ENUM('carte', 'mobile_money', 'virement', 'wave', 'especes'),
        allowNull: false
    },
    operateur: {
        type: DataTypes.STRING(50)
    },
    numero_transaction: {
        type: DataTypes.STRING(100)
    },
    date_paiement: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    statut: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    justificatif: {
        type: DataTypes.STRING(255)
    },
    notes: {
        type: DataTypes.TEXT
    },
    valide_par: {
        type: DataTypes.INTEGER,
        references: {
            model: 'utilisateurs',
            key: 'id'
        }
    },
    date_validation: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'paiements',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (paiement) => {
            // Générer une référence unique
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            paiement.reference = `PAY-${year}${month}-${random}`;
        }
    }
});

// Relations
Paiement.belongsTo(Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });
Paiement.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
Paiement.belongsTo(User, { foreignKey: 'valide_par', as: 'validateur' });

module.exports = Paiement;