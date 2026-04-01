const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const {
    getAllCandidats,
    getCandidatById,
    createCandidat,
    updateCandidatStatus,
    deleteCandidat,
    getCandidatStats
} = require('../controllers/candidatController');

// Configuration multer pour les uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/candidats/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Format de fichier non supporté'));
    }
});

const uploadFields = upload.fields([
    { name: 'diplome', maxCount: 1 },
    { name: 'cin', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'lettre', maxCount: 1 }
]);

// Validation rules
const createCandidatValidation = [
    body('civilite').isIn(['M', 'Mme', 'Mlle']),
    body('nom').notEmpty().withMessage('Nom requis'),
    body('prenom').notEmpty().withMessage('Prénom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone requis'),
    body('formation_choisie_id').isInt().withMessage('Formation requise')
];

const updateStatusValidation = [
    body('statut').isIn(['pending', 'reviewed', 'interview', 'accepted', 'rejected']),
    body('notes_commission').optional().isString(),
    body('date_entretien').optional().isISO8601()
];

// Routes publiques
router.post('/', uploadFields, createCandidatValidation, createCandidat);

// Routes protégées (admin uniquement)
router.use(authenticate);
router.use(authorize('administrateur', 'secretaire'));

router.get('/', getAllCandidats);
router.get('/stats', getCandidatStats);
router.get('/:id', param('id').isInt(), getCandidatById);
router.put('/:id/status', updateStatusValidation, updateCandidatStatus);
router.delete('/:id', param('id').isInt(), deleteCandidat);

module.exports = router;