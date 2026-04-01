const { User, RefreshToken } = require('../models');
const { generateToken, comparePassword } = require('../config/auth');
const { validationResult } = require('express-validator');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Connexion avec JWT
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, remember } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Rechercher l'utilisateur
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            // Journaliser la tentative échouée
            await logFailedAttempt(email, ipAddress);
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        // Vérifier le statut
        if (user.statut !== 'actif') {
            return res.status(401).json({
                success: false,
                message: 'Compte désactivé. Contactez l\'administrateur.'
            });
        }

        // Vérifier le nombre de tentatives
        if (user.login_attempts >= 5) {
            return res.status(401).json({
                success: false,
                message: 'Compte bloqué après trop de tentatives. Contactez l\'administrateur.'
            });
        }

        // Mettre à jour la dernière connexion et réinitialiser les tentatives
        await user.update({
            derniere_connexion: new Date(),
            login_attempts: 0
        });

        // Générer les tokens
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user, ipAddress, userAgent);

        // Journaliser la connexion réussie
        await logSuccessfulLogin(user.id, ipAddress, userAgent);

        // Exclure le mot de passe de la réponse
        const userData = user.toJSON();
        delete userData.password;

        // Définir le cookie pour le refresh token
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 jours ou 1 jour
        };
        
        res.cookie('refreshToken', refreshToken.token, cookieOptions);

        res.json({
            success: true,
            data: {
                user: userData,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: process.env.JWT_EXPIRE
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion.'
        });
    }
};

// Rafraîchir le token d'accès
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Token de rafraîchissement requis'
            });
        }
        
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const result = await tokenService.refreshAccessToken(refreshToken, ipAddress, userAgent);
        
        // Mettre à jour le cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Token de rafraîchissement invalide'
        });
    }
};

// Déconnexion
const logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        if (refreshToken) {
            await tokenService.revokeToken(refreshToken, ipAddress);
        }
        
        // Supprimer le cookie
        res.clearCookie('refreshToken');
        
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};

// Déconnexion de tous les appareils
const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user.id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        await tokenService.revokeAllUserTokens(userId, ipAddress);
        
        res.clearCookie('refreshToken');
        
        res.json({
            success: true,
            message: 'Déconnexion de tous les appareils réussie'
        });
    } catch (error) {
        console.error('Logout all devices error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion de tous les appareils'
        });
    }
};

// Récupérer le profil
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: RefreshToken,
                as: 'refreshTokens',
                attributes: ['id', 'token', 'expires_at', 'revoked', 'created_at'],
                where: { revoked: false },
                required: false
            }]
        });
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil.'
        });
    }
};

// Modifier le profil
const updateProfile = async (req, res) => {
    try {
        const { nom, prenom, telephone } = req.body;
        
        await req.user.update({
            nom,
            prenom,
            telephone
        });
        
        const userData = req.user.toJSON();
        delete userData.password;
        
        res.json({
            success: true,
            data: userData,
            message: 'Profil mis à jour avec succès.'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil.'
        });
    }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        // Vérifier l'ancien mot de passe
        const isValid = await comparePassword(current_password, req.user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel incorrect.'
            });
        }
        
        // Vérifier la complexité du nouveau mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(new_password)) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
            });
        }
        
        // Mettre à jour le mot de passe
        req.user.password = new_password;
        await req.user.save();
        
        // Révoquer tous les tokens de rafraîchissement pour forcer une reconnexion
        const ipAddress = req.ip || req.connection.remoteAddress;
        await tokenService.revokeAllUserTokens(req.user.id, ipAddress);
        
        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de mot de passe.'
        });
    }
};

// Demande de réinitialisation du mot de passe
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Ne pas révéler que l'email n'existe pas pour des raisons de sécurité
            return res.json({
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            });
        }
        
        // Générer un token unique
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
        
        // Sauvegarder le token
        await user.update({
            reset_password_token: resetToken,
            reset_password_expires: resetTokenExpires
        });
        
        // Envoyer l'email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await emailService.sendPasswordReset(user, resetUrl);
        
        res.json({
            success: true,
            message: 'Un lien de réinitialisation a été envoyé à votre adresse email.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email de réinitialisation.'
        });
    }
};

// Réinitialiser le mot de passe
const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;
        
        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token invalide ou expiré.'
            });
        }
        
        // Vérifier la complexité du mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(new_password)) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
            });
        }
        
        // Mettre à jour le mot de passe et effacer le token
        user.password = new_password;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();
        
        // Révoquer tous les tokens
        const ipAddress = req.ip || req.connection.remoteAddress;
        await tokenService.revokeAllUserTokens(user.id, ipAddress);
        
        res.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès. Veuillez vous connecter.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réinitialisation du mot de passe.'
        });
    }
};

// Vérifier le statut du compte
const verifyAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                statut: user.statut,
                deux_facteur_actif: user.deux_facteur_actif
            }
        });
    } catch (error) {
        console.error('Verify account error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du compte.'
        });
    }
};

// Fonctions utilitaires
const logFailedAttempt = async (email, ipAddress) => {
    const user = await User.findOne({ where: { email } });
    if (user) {
        await user.increment('login_attempts');
        if (user.login_attempts >= 5) {
            await user.update({ statut: 'suspendu' });
            await emailService.sendAccountLocked(user);
        }
    }
    
    // Journaliser la tentative dans les logs
    console.log(`Failed login attempt: ${email} from ${ipAddress}`);
};

const logSuccessfulLogin = async (userId, ipAddress, userAgent) => {
    // Journaliser la connexion
    console.log(`Successful login: user ${userId} from ${ipAddress}`);
    // À implémenter: sauvegarder dans la table logs_activite
};

module.exports = {
    login,
    refreshToken,
    logout,
    logoutAllDevices,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyAccount
};