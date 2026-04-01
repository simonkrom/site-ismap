const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
];

const updateProfileValidation = [
    body('nom').optional().isString().notEmpty(),
    body('prenom').optional().isString().notEmpty(),
    body('telephone').optional().isString()
];

const changePasswordValidation = [
    body('current_password').notEmpty().withMessage('Mot de passe actuel requis'),
    body('new_password').isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
];

// Routes publiques
router.post('/login', loginValidation, login);

// Routes protégées
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.post('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;