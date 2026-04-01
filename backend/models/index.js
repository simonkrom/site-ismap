const User = require('./user');
const Formation = require('./Formation');
const Candidat = require('./Candidat');
const Etudiant = require('./Etudiant');
const Paiement = require('./Paiement');
const Actualite = require('./Actualite');

// Définir les relations
User.hasMany(Actualite, { foreignKey: 'auteur_id', as: 'articles' });
Actualite.belongsTo(User, { foreignKey: 'auteur_id', as: 'auteur' });

Formation.hasMany(Candidat, { foreignKey: 'formation_choisie_id', as: 'candidats' });
Candidat.belongsTo(Formation, { foreignKey: 'formation_choisie_id', as: 'formation' });

Formation.hasMany(Etudiant, { foreignKey: 'formation_id', as: 'etudiants' });
Etudiant.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

Etudiant.hasMany(Paiement, { foreignKey: 'etudiant_id', as: 'paiements' });
Paiement.belongsTo(Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });

Formation.hasMany(Paiement, { foreignKey: 'formation_id', as: 'paiements' });
Paiement.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

User.hasMany(Paiement, { foreignKey: 'valide_par', as: 'validations' });
Paiement.belongsTo(User, { foreignKey: 'valide_par', as: 'validateur' });

module.exports = {
    User,
    Formation,
    Candidat,
    Etudiant,
    Paiement,
    Actualite
};