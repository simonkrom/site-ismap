const { verifyToken } = require('../config/auth');
const { User } = require('../models');
const { sequelize } = require('../config/database');

// Middleware d'authentification
const authenticate = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé. Token manquant.',
                code: 'MISSING_TOKEN'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Vérifier et décoder le token
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré.',
                code: 'INVALID_TOKEN'
            });
        }
        
        // Récupérer l'utilisateur
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé.',
                code: 'USER_NOT_FOUND'
            });
        }
        
        // Vérifier le statut du compte
        if (user.statut !== 'actif') {
            return res.status(401).json({
                success: false,
                message: user.statut === 'suspendu' 
                    ? 'Compte suspendu. Contactez l\'administrateur.'
                    : 'Compte désactivé. Contactez l\'administrateur.',
                code: 'ACCOUNT_DISABLED'
            });
        }
        
        // Vérifier si le token est dans la blacklist (optionnel)
        // const isBlacklisted = await checkTokenBlacklist(token);
        // if (isBlacklisted) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Token révoqué.',
        //         code: 'TOKEN_REVOKED'
        //     });
        // }
        
        // Attacher l'utilisateur et le token à la requête
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification.',
            code: 'AUTH_ERROR'
        });
    }
};

// Middleware de vérification des rôles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié.',
                code: 'UNAUTHENTICATED'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès interdit. Vous n\'avez pas les droits nécessaires.',
                code: 'FORBIDDEN',
                required_roles: roles,
                user_role: req.user.role
            });
        }
        
        next();
    };
};

// Middleware de vérification des permissions
const hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur a la permission via ses rôles
            const permissions = {
                administrateur: [
                    'candidats_view', 'candidats_edit', 'candidats_delete',
                    'etudiants_view', 'etudiants_edit', 'etudiants_delete',
                    'paiements_view', 'paiements_edit',
                    'formations_view', 'formations_edit', 'formations_delete',
                    'contenu_view', 'contenu_edit',
                    'utilisateurs_view', 'utilisateurs_edit',
                    'parametres_edit'
                ],
                comptable: [
                    'paiements_view', 'paiements_edit',
                    'etudiants_view'
                ],
                secretaire: [
                    'candidats_view', 'candidats_edit',
                    'etudiants_view',
                    'paiements_view'
                ],
                enseignant: [
                    'etudiants_view',
                    'contenu_view'
                ]
            };
            
            const userPermissions = permissions[req.user.role] || [];
            
            if (!userPermissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Permission '${permission}' requise.`,
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }
            
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur de vérification des permissions.',
                code: 'PERMISSION_ERROR'
            });
        }
    };
};

// Middleware de vérification du refresh token
const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Token de rafraîchissement requis.',
                code: 'REFRESH_TOKEN_REQUIRED'
            });
        }
        
        const tokenRecord = await RefreshToken.findOne({
            where: {
                token: refreshToken,
                revoked: false,
                expires_at: { [Op.gt]: new Date() }
            },
            include: [{ model: User, as: 'user' }]
        });
        
        if (!tokenRecord) {
            return res.status(401).json({
                success: false,
                message: 'Token de rafraîchissement invalide ou expiré.',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }
        
        req.refreshToken = tokenRecord;
        next();
    } catch (error) {
        console.error('Verify refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur de vérification du token.',
            code: 'REFRESH_TOKEN_ERROR'
        });
    }
};

// Middleware de logging des actions
const logAction = (action) => {
    return async (req, res, next) => {
        const startTime = Date.now();
        
        // Capturer la réponse originale
        const originalJson = res.json;
        res.json = function(data) {
            const duration = Date.now() - startTime;
            
            // Logger l'action
            console.log({
                action,
                user: req.user?.id,
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
            
            // Appeler la fonction originale
            originalJson.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    authenticate,
    authorize,
    hasPermission,
    verifyRefreshToken,
    logAction
};