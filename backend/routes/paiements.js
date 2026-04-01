const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
    createPaiement,
    validatePaiement,
    checkPaiementStatus,
    stripeWebhook,
    moovWebhook
} = require('../controllers/paymentController');

// Validation rules
const createPaiementValidation = [
    body('etudiant_id').isInt().withMessage('Étudiant requis'),
    body('formation_id').isInt().withMessage('Formation requise'),
    body('montant').isDecimal().withMessage('Montant invalide'),
    body('methode').isIn(['carte', 'mobile_money', 'wave']).withMessage('Méthode invalide'),
    body('operateur').optional().isIn(['airtel', 'moov']).withMessage('Opérateur invalide'),
    body('phoneNumber').optional().isString().withMessage('Numéro de téléphone requis pour Mobile Money'),
    body('description').optional().isString()
];

const validatePaiementValidation = [
    body('paiement_id').isInt().withMessage('ID paiement requis'),
    body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP invalide'),
    body('phoneNumber').isString().withMessage('Numéro de téléphone requis'),
    body('amount').isDecimal().withMessage('Montant requis'),
    body('transactionId').optional().isString()
];

// Routes publiques (webhooks)
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/moov-webhook', express.json(), moovWebhook);

// Routes protégées
router.use(authenticate);

router.post('/', createPaiementValidation, createPaiement);
router.post('/validate', validatePaiementValidation, validatePaiement);
router.get('/status/:reference', param('reference').isString(), checkPaiementStatus);

module.exports = router;