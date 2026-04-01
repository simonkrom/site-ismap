const { Candidat, Formation } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Récupérer tous les candidats
const getAllCandidats = async (req, res) => {
    try {
        const { page = 1, limit = 20, statut, formation, search } = req.query;
        const offset = (page - 1) * limit;
        
        const where = {};
        if (statut) where.statut = statut;
        if (formation) where.formation_choisie_id = formation;
        if (search) {
            where[Op.or] = [
                { nom: { [Op.like]: `%${search}%` } },
                { prenom: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { num_dossier: { [Op.like]: `%${search}%` } }
            ];
        }
        
        const { count, rows } = await Candidat.findAndCountAll({
            where,
            include: [{ model: Formation, as: 'formation' }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit),
                candidats: rows
            }
        });
    } catch (error) {
        console.error('Get all candidats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidats.'
        });
    }
};

// Récupérer un candidat par ID
const getCandidatById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidat = await Candidat.findByPk(id, {
            include: [{ model: Formation, as: 'formation' }]
        });
        
        if (!candidat) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé.'
            });
        }
        
        res.json({
            success: true,
            data: candidat
        });
    } catch (error) {
        console.error('Get candidat error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du candidat.'
        });
    }
};

// Créer une préinscription
const createCandidat = async (req, res) => {
    try {
        const candidatData = req.body;
        
        // Vérifier si l'email existe déjà
        const existing = await Candidat.findOne({
            where: { email: candidatData.email }
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Un dossier existe déjà avec cet email.'
            });
        }
        
        // Traiter les fichiers uploadés
        if (req.files) {
            if (req.files.diplome) candidatData.documents_diplome = req.files.diplome[0].filename;
            if (req.files.cin) candidatData.documents_cin = req.files.cin[0].filename;
            if (req.files.photo) candidatData.documents_photo = req.files.photo[0].filename;
            if (req.files.cv) candidatData.documents_cv = req.files.cv[0].filename;
            if (req.files.lettre) candidatData.documents_lettre = req.files.lettre[0].filename;
        }
        
        const candidat = await Candidat.create(candidatData);
        
        // Envoyer un email de confirmation
        // await emailService.sendConfirmation(candidat);
        
        res.status(201).json({
            success: true,
            data: candidat,
            message: 'Préinscription enregistrée avec succès.'
        });
    } catch (error) {
        console.error('Create candidat error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de la préinscription.'
        });
    }
};

// Mettre à jour le statut d'un candidat
const updateCandidatStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, notes_commission, date_entretien } = req.body;
        
        const candidat = await Candidat.findByPk(id);
        if (!candidat) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé.'
            });
        }
        
        await candidat.update({
            statut,
            notes_commission,
            date_entretien
        });
        
        // Envoyer un email de notification
        // await emailService.sendStatusUpdate(candidat);
        
        res.json({
            success: true,
            data: candidat,
            message: 'Statut du candidat mis à jour.'
        });
    } catch (error) {
        console.error('Update candidat status error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut.'
        });
    }
};

// Supprimer un candidat
const deleteCandidat = async (req, res) => {
    try {
        const { id } = req.params;
        const candidat = await Candidat.findByPk(id);
        
        if (!candidat) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé.'
            });
        }
        
        // Supprimer les fichiers associés
        const files = [
            candidat.documents_diplome,
            candidat.documents_cin,
            candidat.documents_photo,
            candidat.documents_cv,
            candidat.documents_lettre
        ];
        
        files.forEach(file => {
            if (file) {
                const filePath = path.join(__dirname, '../uploads/candidats/', file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });
        
        await candidat.destroy();
        
        res.json({
            success: true,
            message: 'Candidat supprimé avec succès.'
        });
    } catch (error) {
        console.error('Delete candidat error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du candidat.'
        });
    }
};

// Statistiques des candidats
const getCandidatStats = async (req, res) => {
    try {
        const stats = await Candidat.findAll({
            attributes: [
                'statut',
                [sequelize.fn('COUNT', sequelize.col('statut')), 'count']
            ],
            group: ['statut']
        });
        
        const total = await Candidat.count();
        
        res.json({
            success: true,
            data: {
                total,
                byStatus: stats
            }
        });
    } catch (error) {
        console.error('Get candidat stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques.'
        });
    }
};

module.exports = {
    getAllCandidats,
    getCandidatById,
    createCandidat,
    updateCandidatStatus,
    deleteCandidat,
    getCandidatStats
};