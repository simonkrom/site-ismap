const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
    getAllFormations,
    getFormationById,
    createFormation,
    updateFormation,
    deleteFormation
} = require('../controllers/formationController');

// Validation rules
const createFormationValidation = [
    body('titre').notEmpty().withMessage('Titre requis'),
    body('categorie').isIn(['licence', 'master', 'professionnelle']),
    body('duree').optional().isString(),
    body('frais_inscription').optional().isDecimal(),
    body('frais_scolarite').optional().isDecimal()
];

const updateFormationValidation = [
    body('titre').optional().notEmpty(),
    body('categorie').optional().isIn(['licence', 'master', 'professionnelle']),
    body('statut').optional().isIn(['active', 'inactive'])
];

// Routes publiques
router.get('/', getAllFormations);
router.get('/:id', param('id').isInt(), getFormationById);

// Routes protégées
router.use(authenticate);
router.use(authorize('administrateur'));

router.post('/', createFormationValidation, createFormation);
router.put('/:id', param('id').isInt(), updateFormationValidation, updateFormation);
router.delete('/:id', param('id').isInt(), deleteFormation);

module.exports = router;