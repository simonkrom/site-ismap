const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');
const { sequelize } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_TOKEN_EXPIRE_DAYS = 30;

// Générer un token d'accès (JWT)
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            prenom: user.prenom
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
    );
};

// Générer un token de rafraîchissement
const generateRefreshToken = async (user, ipAddress, userAgent) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRE_DAYS);
    
    const refreshToken = await RefreshToken.create({
        token,
        user_id: user.id,
        expires_at: expiresAt,
        user_agent: userAgent,
        revoked_by_ip: ipAddress
    });
    
    return refreshToken;
};

// Vérifier et rafraîchir le token
const refreshAccessToken = async (refreshTokenString, ipAddress, userAgent) => {
    const refreshToken = await RefreshToken.findOne({
        where: {
            token: refreshTokenString,
            revoked: false
        },
        include: [{ model: sequelize.models.User, as: 'user' }]
    });
    
    if (!refreshToken) {
        throw new Error('Token de rafraîchissement invalide');
    }
    
    if (refreshToken.expires_at < new Date()) {
        await refreshToken.update({ revoked: true, revoked_at: new Date(), revoked_by_ip: ipAddress });
        throw new Error('Token de rafraîchissement expiré');
    }
    
    const user = refreshToken.user;
    if (!user || user.statut !== 'actif') {
        throw new Error('Utilisateur invalide ou désactivé');
    }
    
    // Générer un nouveau token d'accès
    const newAccessToken = generateAccessToken(user);
    
    // Mettre à jour les informations du refresh token
    await refreshToken.update({
        user_agent: userAgent,
        revoked_by_ip: ipAddress
    });
    
    return {
        accessToken: newAccessToken,
        refreshToken: refreshToken.token,
        user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role
        }
    };
};

// Révoquer tous les tokens d'un utilisateur
const revokeAllUserTokens = async (userId, ipAddress) => {
    await RefreshToken.update(
        {
            revoked: true,
            revoked_at: new Date(),
            revoked_by_ip: ipAddress
        },
        {
            where: {
                user_id: userId,
                revoked: false
            }
        }
    );
};

// Révoquer un token spécifique
const revokeToken = async (token, ipAddress) => {
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    if (refreshToken) {
        await refreshToken.update({
            revoked: true,
            revoked_at: new Date(),
            revoked_by_ip: ipAddress
        });
    }
};

// Nettoyer les tokens expirés
const cleanupExpiredTokens = async () => {
    await RefreshToken.destroy({
        where: {
            expires_at: { [sequelize.Op.lt]: new Date() }
        }
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken,
    revokeAllUserTokens,
    revokeToken,
    cleanupExpiredTokens
};