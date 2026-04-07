const { Paiement, Etudiant, Formation } = require('../models');
const paymentFactory = require('../services/paymentFactory');
const emailService = require('../services/emailService');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Créer un paiement
const createPaiement = async (req, res) => {
    try {
        const { 
            etudiant_id, 
            formation_id, 
            montant, 
            methode, 
            operateur, 
            phoneNumber,
            description 
        } = req.body;
        
        // Vérifier l'étudiant et la formation
        const etudiant = await Etudiant.findByPk(etudiant_id);
        if (!etudiant) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        
        const formation = await Formation.findByPk(formation_id);
        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée'
            });
        }
        
        // Générer une référence unique
        const reference = `ISMAP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        // Préparer les données pour le service de paiement
        const paymentData = {
            method: methode,
            operator: operateur,
            amount: montant,
            phoneNumber,
            description: description || `Frais de scolarité ${formation.titre}`,
            reference
        };
        
        // Traiter le paiement via la factory
        const paymentResult = await paymentFactory.processPayment(paymentData);
        
        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: paymentResult.error,
                code: paymentResult.code
            });
        }
        
        // Enregistrer le paiement en base
        const paiement = await Paiement.create({
            reference,
            etudiant_id,
            formation_id,
            montant,
            methode,
            operateur,
            numero_transaction: paymentResult.transactionId,
            statut: paymentResult.requiresOtp ? 'pending' : 'success',
            frais_inscription: formation.frais_inscription,
            frais_scolarite: formation.frais_scolarite,
            frais_dossier: formation.frais_dossier,
            date_paiement: new Date()
        });
        
        // Si le paiement est réussi directement (carte, direct)
        if (paymentResult.status === 'success') {
            await emailService.sendReceipt(paiement, etudiant);
        }
        
        res.json({
            success: true,
            data: {
                paiement,
                requiresOtp: paymentResult.requiresOtp || false,
                transactionId: paymentResult.transactionId,
                clientSecret: paymentResult.clientSecret, // Pour Stripe
                message: paymentResult.message
            }
        });
    } catch (error) {
        logger.error('Create paiement error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'initiation du paiement'
        });
    }
};

// Valider un paiement (pour OTP Mobile Money)
const validatePaiement = async (req, res) => {
    try {
        const { 
            paiement_id, 
            otp, 
            phoneNumber, 
            amount, 
            transactionId 
        } = req.body;
        
        const paiement = await Paiement.findByPk(paiement_id, {
            include: [{ model: Etudiant, as: 'etudiant' }]
        });
        
        if (!paiement) {
            return res.status(404).json({
                success: false,
                message: 'Paiement non trouvé'
            });
        }
        
        if (paiement.statut === 'success') {
            return res.status(400).json({
                success: false,
                message: 'Ce paiement est déjà validé'
            });
        }
        
        const validationData = {
            method: paiement.methode,
            phoneNumber,
            amount,
            otp,
            transactionId,
            reference: paiement.reference
        };
        
        const validationResult = await paymentFactory.validatePayment(validationData);
        
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error
            });
        }
        
        // Mettre à jour le statut du paiement
        await paiement.update({
            statut: 'success',
            numero_transaction: validationResult.transactionId,
            date_validation: new Date()
        });
        
        // Envoyer le reçu par email
        await emailService.sendReceipt(paiement, paiement.etudiant);
        
        res.json({
            success: true,
            message: 'Paiement validé avec succès',
            data: paiement
        });
    } catch (error) {
        logger.error('Validate paiement error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation du paiement'
        });
    }
};

// Vérifier le statut d'un paiement
const checkPaiementStatus = async (req, res) => {
    try {
        const { reference } = req.params;
        
        const paiement = await Paiement.findOne({
            where: { reference },
            include: [{ model: Etudiant, as: 'etudiant' }]
        });
        
        if (!paiement) {
            return res.status(404).json({
                success: false,
                message: 'Paiement non trouvé'
            });
        }
        
        // Vérifier le statut auprès du fournisseur
        const statusResult = await paymentFactory.checkStatus(
            paiement.methode,
            paiement.numero_transaction || paiement.reference,
            paiement.operateur
        );
        
        if (statusResult.success && statusResult.status !== paiement.statut) {
            await paiement.update({ statut: statusResult.status });
        }
        
        res.json({
            success: true,
            data: {
                reference: paiement.reference,
                statut: paiement.statut,
                externalStatus: statusResult.status,
                montant: paiement.montant,
                date: paiement.date_paiement
            }
        });
    } catch (error) {
        logger.error('Check paiement status error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du paiement'
        });
    }
};

// Webhook Stripe
const stripeWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const result = await stripeService.handleWebhook(req.body, signature);
        
        if (!result.success) {
            return res.status(400).send('Webhook error');
        }
        
        res.json({ received: true });
    } catch (error) {
        logger.error('Stripe webhook error:', error);
        res.status(500).send('Webhook error');
    }
};

// Webhook Moov (callback)
const moovWebhook = async (req, res) => {
    try {
        const { reference_id, status, trans_id } = req.body;
        
        logger.info(`Moov webhook reçu: ${reference_id} - ${status}`);
        
        const paiement = await Paiement.findOne({
            where: { reference: reference_id }
        });
        
        if (paiement && status === 'SUCCESS') {
            await paiement.update({
                statut: 'success',
                numero_transaction: trans_id,
                date_validation: new Date()
            });
            
            const etudiant = await Etudiant.findByPk(paiement.etudiant_id);
            await emailService.sendReceipt(paiement, etudiant);
        }
        
        res.json({ received: true });
    } catch (error) {
        logger.error('Moov webhook error:', error);
        res.status(500).send('Webhook error');
    }
};

// Webhook SingPay (callback)
const singpayWebhook = async (req, res) => {
    try {
        const { reference, id, status, result } = req.body;
        
        logger.info(`SingPay webhook reçu: ${reference} - Status: ${status}, Result: ${result}`);
        
        const paiement = await Paiement.findOne({
            where: { reference: reference }
        });
        
        if (!paiement) {
            logger.warn(`Paiement non trouvé pour référence: ${reference}`);
            return res.json({ received: true });
        }
        
        // Mettre à jour le paiement selon le status et result
        let updateData = {
            numero_transaction: id
        };
        
        if (status === 'Terminate') {
            if (result === 'Success') {
                updateData.statut = 'success';
                updateData.date_validation = new Date();
            } else if (result === 'PasswordError' || result === 'BalanceError') {
                updateData.statut = 'failed';
            }
        }
        
        await paiement.update(updateData);
        
        // Si le paiement est réussi, envoyer un reçu
        if (updateData.statut === 'success') {
            const etudiant = await Etudiant.findByPk(paiement.etudiant_id);
            await emailService.sendReceipt(paiement, etudiant);
        }
        
        res.json({ received: true });
    } catch (error) {
        logger.error('SingPay webhook error:', error);
        res.status(500).send('Webhook error');
    }
};

module.exports = {
    createPaiement,
    validatePaiement,
    checkPaiementStatus,
    stripeWebhook,
    moovWebhook,
    singpayWebhook
};