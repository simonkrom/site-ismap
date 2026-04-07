const stripeService = require('./stripeService');
const airtelMoneyService = require('./airtelMoneyService');
const moovMoneyService = require('./moovMoneyService');
const singpayService = require('./singpayService');
const logger = require('../utils/logger');

/**
 * Factory pour les services de paiement
 */
class PaymentFactory {
    /**
     * Obtenir le service approprié selon la méthode
     * @param {string} method - carte, mobile_money, singpay
     * @param {string} operator - airtel, moov, wave (pour mobile_money), airtel, moov (pour singpay)
     */
    getService(method, operator = null) {
        switch (method) {
            case 'carte':
                return stripeService;
            case 'mobile_money':
                if (operator === 'airtel') {
                    return airtelMoneyService;
                } else if (operator === 'moov') {
                    return moovMoneyService;
                }
                throw new Error(`Opérateur mobile non supporté: ${operator}`);
            case 'wave':
                // Wave utilise l'API Moov Money (partenaire)
                return moovMoneyService;
            case 'singpay':
                // SingPay supporte Airtel et Moov Money
                if (operator === 'airtel' || operator === 'moov') {
                    return singpayService;
                }
                throw new Error(`Opérateur SingPay non supporté: ${operator}`);
            default:
                throw new Error(`Méthode de paiement non supportée: ${method}`);
        }
    }

    /**
     * Traiter un paiement
     * @param {object} paymentData 
     */
    async processPayment(paymentData) {
        const { method, operator, amount, phoneNumber, description, reference } = paymentData;
        
        try {
            const service = this.getService(method, operator);
            
            switch (method) {
                case 'carte':
                    return await service.createPaymentIntent(amount, 'XAF', {
                        reference,
                        description
                    });
                    
                case 'mobile_money':
                    if (operator === 'airtel') {
                        return await service.initiatePayment(phoneNumber, amount, description, reference);
                    } else if (operator === 'moov') {
                        // Moov utilise le flux OTP
                        return await service.initiatePaymentWithOTP(phoneNumber, amount, description, reference);
                    }
                    break;
                    
                case 'wave':
                    // Wave utilise le paiement direct Moov
                    return await moovMoneyService.initiateDirectPayment(phoneNumber, amount, description, reference);
                
                case 'singpay':
                    if (operator === 'airtel') {
                        return await singpayService.initiateAirtelMoneyPayment({
                            amount,
                            phoneNumber,
                            reference,
                            description
                        });
                    } else if (operator === 'moov') {
                        return await singpayService.initiateMoovMoneyPayment({
                            amount,
                            phoneNumber,
                            reference,
                            description
                        });
                    }
                    break;
                    
                default:
                    throw new Error(`Méthode non supportée: ${method}`);
            }
        } catch (error) {
            logger.error(`Payment processing error (${method}/${operator}):`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Valider un paiement (pour Moov OTP)
     * @param {object} validationData 
     */
    async validatePayment(validationData) {
        const { method, phoneNumber, amount, otp, transactionId, reference } = validationData;
        
        if (method !== 'mobile_money') {
            throw new Error('La validation OTP est uniquement pour Mobile Money');
        }
        
        try {
            return await moovMoneyService.validatePaymentWithOTP(
                phoneNumber,
                amount,
                otp,
                transactionId,
                reference
            );
        } catch (error) {
            logger.error('Payment validation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * @param {string} method 
     * @param {string} reference 
     * @param {string} operator 
     */
    async checkStatus(method, reference, operator = null) {
        try {
            const service = this.getService(method, operator);
            
            if (method === 'carte') {
                return await service.getPaymentStatus(reference);
            } else if (method === 'mobile_money') {
                if (operator === 'airtel') {
                    return await service.checkPaymentStatus(reference);
                } else if (operator === 'moov') {
                    return await service.checkTransactionStatus(reference);
                }
            } else if (method === 'wave') {
                return await moovMoneyService.checkTransactionStatus(reference);
            } else if (method === 'singpay') {
                return await singpayService.getTransactionByReference(reference);
            }
            
            throw new Error(`Méthode non supportée pour vérification: ${method}`);
        } catch (error) {
            logger.error('Check status error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new PaymentFactory();