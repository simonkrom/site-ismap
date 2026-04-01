const Stripe = require('stripe');
const logger = require('../utils/logger');

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            maxNetworkRetries: 3,
            appInfo: {
                name: 'ISMAP²',
                version: '1.0.0',
                url: 'https://ismap2.com'
            }
        });
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Créer une intention de paiement (PaymentIntent)
     * @param {number} amount - Montant en FCFA (converti en centimes)
     * @param {string} currency - Devise (XAF)
     * @param {object} metadata - Métadonnées additionnelles
     */
    async createPaymentIntent(amount, currency = 'XAF', metadata = {}) {
        try {
            // Stripe utilise les centimes pour XAF
            const amountInCentimes = Math.round(amount * 100);
            
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInCentimes,
                currency: currency.toLowerCase(),
                metadata: {
                    ...metadata,
                    platform: 'ISMAP²',
                    timestamp: new Date().toISOString()
                },
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });
            
            logger.info(`PaymentIntent créé: ${paymentIntent.id} - ${amount} XAF`);
            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100
            };
        } catch (error) {
            logger.error('Stripe createPaymentIntent error:', error);
            return {
                success: false,
                error: error.message,
                type: error.type
            };
        }
    }

    /**
     * Confirmer un paiement (côté serveur)
     * @param {string} paymentIntentId - ID du PaymentIntent
     */
    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
            
            if (paymentIntent.status === 'succeeded') {
                logger.info(`Paiement confirmé: ${paymentIntentId}`);
                return {
                    success: true,
                    paymentIntent,
                    status: paymentIntent.status
                };
            }
            
            return {
                success: false,
                status: paymentIntent.status,
                message: `Paiement en attente: ${paymentIntent.status}`
            };
        } catch (error) {
            logger.error('Stripe confirmPayment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Récupérer le statut d'un paiement
     * @param {string} paymentIntentId 
     */
    async getPaymentStatus(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
                expand: ['charges.data.balance_transaction']
            });
            
            return {
                success: true,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata
            };
        } catch (error) {
            logger.error('Stripe getPaymentStatus error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Traitement du webhook Stripe
     * @param {string} payload - Body brut de la requête
     * @param {string} signature - Signature Stripe
     */
    async handleWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.webhookSecret
            );
            
            logger.info(`Webhook Stripe reçu: ${event.type}`);
            
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                case 'charge.refunded':
                    await this.handleRefund(event.data.object);
                    break;
                default:
                    logger.info(`Webhook non géré: ${event.type}`);
            }
            
            return { success: true, event };
        } catch (error) {
            logger.error('Webhook Stripe error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gestionnaire de paiement réussi
     */
    async handlePaymentSuccess(paymentIntent) {
        // Mettre à jour la base de données
        // Envoyer email de confirmation
        logger.info(`Paiement réussi: ${paymentIntent.id} - ${paymentIntent.amount / 100} XAF`);
    }

    /**
     * Gestionnaire de paiement échoué
     */
    async handlePaymentFailure(paymentIntent) {
        logger.warn(`Paiement échoué: ${paymentIntent.id}`);
    }

    /**
     * Gestionnaire de remboursement
     */
    async handleRefund(charge) {
        logger.info(`Remboursement effectué: ${charge.id}`);
    }
}

module.exports = new StripeService();