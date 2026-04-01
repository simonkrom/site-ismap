# ISMAP² - Institut Supérieur de Management

Plateforme web complète pour la gestion des admissions, formations et paiements.

## 📋 Architecture

### Frontend
- HTML5, CSS3, JavaScript vanilla
- Pages responsives
- Admin panel

### Backend
- **Node.js + Express.js**
- **MySQL + Sequelize ORM**
- Authentification JWT
- Intégration paiements (Stripe, Airtel Money, Moov Money)
- Middleware de sécurité (Helmet, CORS, Rate limiting)

## 🚀 Démarrage local

### Prérequis
- Node.js 14+
- MySQL 5.7+

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/simonkrom/site-ismap.git
cd site-ismap

# 2. Installer les dépendances backend
cd backend
npm install

# 3. Configurer l'environnement
cp ../.env.example ../.env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npm run migrate

# 5. Démarrer le serveur
npm run dev  # Développement
npm start    # Production
```

Le serveur sera disponible sur `http://localhost:5000`

## 📁 Structure du projet

```
├── backend/
│   ├── config/          # Configuration (DB, Auth)
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Middleware Express
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── services/        # Services (Paiements)
│   ├── server.js        # Point d'entrée
│   └── package.json
│
├── public/
│   ├── index.html       # Page d'accueil
│   ├── admin/           # Panel admin
│   ├── css/             # Styles
│   └── js/              # Scripts frontend
│
├── .env                 # Variables d'environnement (⚠️ Ne pas versionner)
├── .env.example         # Template .env
├── .gitignore           # Fichiers ignorés
└── Procfile            # Configuration Heroku

```

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Hashage des mots de passe (bcryptjs)
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Validation des inputs
- ✅ Helmet pour les headers de sécurité

## 📦 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir token

### Candidats
- `GET /api/candidats` - Lister
- `POST /api/candidats` - Créer
- `GET /api/candidats/:id` - Détail
- `PUT /api/candidats/:id` - Modifier

### Formations
- `GET /api/formations` - Lister tous
- `GET /api/formations/:id` - Détail

### Paiements
- `POST /api/paiements` - Créer paiement
- `GET /api/paiements/:id` - Statut

### Santé
- `GET /api/health` - État du serveur

## 🌐 Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour les instructions de déploiement sur Heroku.

### Déploiement rapide

```bash
# 1. Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Créer app et ajouter MySQL
heroku create mon-app
heroku addons:create jawsdb:kitefin

# 3. Configurer les variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_secret

# 4. Déployer
git push heroku main

# 5. Initialiser DB
heroku run "cd backend && npm run migrate"
```

## 📝 Variables d'environnement requises

Voir `.env.example` pour la liste complète.

## 👇 Contribuer

Les contributions sont les bienvenues ! Créez une branche feature et soumettez une pull request.

## 📄 License

MIT

---

**Développé par** : Simon Nzong
**Repository** : https://github.com/simonkrom/site-ismap
