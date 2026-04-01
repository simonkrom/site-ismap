const { refreshAccessToken } = require('../services/tokenService');

// Middleware de rafraîchissement de token
const refreshTokenMiddleware = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Token de rafraîchissement requis'
            });
        }
        
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const result = await refreshAccessToken(refreshToken, ipAddress, userAgent);
        
        // Attacher les nouveaux tokens à la requête
        req.newTokens = result;
        next();
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({
            success: false,
            message: error.message || 'Token de rafraîchissement invalide'
        });
    }
};

module.exports = refreshTokenMiddleware;