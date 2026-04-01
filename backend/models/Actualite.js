const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Actualite = sequelize.define('Actualite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(200),
        unique: true,
        allowNull: false
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.STRING(255)
    },
    categorie: {
        type: DataTypes.ENUM('evenement', 'formation', 'vie_etudiante', 'partenariat'),
        defaultValue: 'evenement'
    },
    auteur: {
        type: DataTypes.STRING(100)
    },
    auteur_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'utilisateurs',
            key: 'id'
        }
    },
    statut: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    date_publication: {
        type: DataTypes.DATE
    },
    vues: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'actualites',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (actualite) => {
            if (!actualite.slug) {
                actualite.slug = actualite.titre
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
            }
        }
    }
});

// Relations
Actualite.belongsTo(User, { foreignKey: 'auteur_id', as: 'auteur' });

module.exports = Actualite;