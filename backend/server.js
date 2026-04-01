const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Importation des modules
const { testConnection } = require('./config/database');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://ismap2.com', 'https://admin.ismap2.com']
        : '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite de 100 requêtes par IP
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidats', require('./routes/candidats'));
app.use('/api/etudiants', require('./routes/etudiants'));
app.use('/api/formations', require('./routes/formations'));
app.use('/api/paiements', require('./routes/paiements'));
app.use('/api/actualites', require('./routes/actualites'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/statistiques', require('./routes/statistiques'));
app.use('/api/parametres', require('./routes/parametres'));

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    logger.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: err.errors
        });
    }
    
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur lors de l\'upload du fichier',
            error: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Démarrage du serveur
const startServer = async () => {
    try {
        // Test de connexion à la base de données
        await testConnection();
        
        // Synchronisation des modèles (uniquement en développement)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Base de données synchronisée');
        }
        
        // Démarrage du serveur
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📝 Environnement: ${process.env.NODE_ENV}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
        });
        
    } catch (error) {
        console.error('❌ Erreur au démarrage:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;