const { Formation } = require('../models');
const { Op } = require('sequelize');

// Récupérer toutes les formations
const getAllFormations = async (req, res) => {
    try {
        const { categorie, statut, search } = req.query;
        
        const where = {};
        if (categorie) where.categorie = categorie;
        if (statut) where.statut = statut;
        if (search) {
            where[Op.or] = [
                { titre: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }
        
        const formations = await Formation.findAll({
            where,
            order: [['categorie', 'ASC'], ['titre', 'ASC']]
        });
        
        res.json({
            success: true,
            data: formations
        });
    } catch (error) {
        console.error('Get all formations error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des formations.'
        });
    }
};

// Récupérer une formation par ID
const getFormationById = async (req, res) => {
    try {
        const { id } = req.params;
        const formation = await Formation.findByPk(id);
        
        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée.'
            });
        }
        
        res.json({
            success: true,
            data: formation
        });
    } catch (error) {
        console.error('Get formation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la formation.'
        });
    }
};

// Créer une formation
const createFormation = async (req, res) => {
    try {
        const formationData = req.body;
        
        // Vérifier si le code existe
        if (formationData.code) {
            const existing = await Formation.findOne({
                where: { code: formationData.code }
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Ce code de formation existe déjà.'
                });
            }
        }
        
        const formation = await Formation.create(formationData);
        
        res.status(201).json({
            success: true,
            data: formation,
            message: 'Formation créée avec succès.'
        });
    } catch (error) {
        console.error('Create formation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la formation.'
        });
    }
};

// Mettre à jour une formation
const updateFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const formation = await Formation.findByPk(id);
        
        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée.'
            });
        }
        
        await formation.update(req.body);
        
        res.json({
            success: true,
            data: formation,
            message: 'Formation mise à jour avec succès.'
        });
    } catch (error) {
        console.error('Update formation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la formation.'
        });
    }
};

// Supprimer une formation
const deleteFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const formation = await Formation.findByPk(id);
        
        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée.'
            });
        }
        
        await formation.destroy();
        
        res.json({
            success: true,
            message: 'Formation supprimée avec succès.'
        });
    } catch (error) {
        console.error('Delete formation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la formation.'
        });
    }
};

module.exports = {
    getAllFormations,
    getFormationById,
    createFormation,
    updateFormation,
    deleteFormation
};