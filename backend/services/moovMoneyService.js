const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class MoovMoneyService {
    constructor() {
        this.apiUrl = process.env.MOOV_API_URL || 'https://api.moov.ga';
        this.username = process.env.MOOV_USERNAME;
        this.password = process.env.MOOV_PASSWORD;
        this.merchantId = process.env.MOOV_MERCHANT_ID;
        this.apiKey = process.env.MOOV_API_KEY;
        this.sessionToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Générer le token de session
     */
    async getSessionToken() {
        if (this.sessionToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
            return this.sessionToken;
        }

        try {
            const response = await axios.post(`${this.apiUrl}/api/v1/auth/login`, {
                username: this.username,
                password: this.password,
                merchant_id: this.merchantId
            });

            this.sessionToken = response.data.token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            logger.info('Session Moov Money obtenue');
            return this.sessionToken;
        } catch (error) {
            logger.error('Moov getSessionToken error:', error.response?.data || error.message);
            throw new Error('Impossible de s\'authentifier auprès de Moov Money');
        }
    }

    /**
     * Créer un paiement avec OTP (flux complet)
     * @param {string} phoneNumber - Numéro du client (format 06XXXXXXXX)
     * @param {number} amount - Montant en XAF
     * @param {string} description - Description du paiement
     * @param {string} reference - Référence unique
     */
    async initiatePaymentWithOTP(phoneNumber, amount, description, reference) {
        try {
            const token = await this.getSessionToken();
            
            // Étape 1: Demander l'envoi d'un OTP
            const initResponse = await axios.post(`${this.apiUrl}/api/v1/payments/otp/initiate`, {
                phone_number: phoneNumber,
                amount: amount,
                description: description,
                reference_id: reference,
                currency: 'XAF',
                callback_url: `${process.env.API_URL}/api/paiements/moov-callback`
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Merchant-ID': this.merchantId
                }
            });
            
            if (initResponse.data.status !== '0') {
                return {
                    success: false,
                    error: initResponse.data.message,
                    code: initResponse.data.status
                };
            }
            
            const transactionId = initResponse.data['trans-id'];
            
            logger.info(`OTP Moov envoyé: ${reference} - transaction: ${transactionId}`);
            
            return {
                success: true,
                requiresOtp: true,
                transactionId: transactionId,
                reference: reference,
                message: 'Code OTP envoyé par SMS'
            };
        } catch (error) {
            logger.error('Moov initiatePaymentWithOTP error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Valider le paiement avec OTP
     * @param {string} phoneNumber - Numéro du client
     * @param {number} amount - Montant
     * @param {string} otp - Code OTP reçu par SMS
     * @param {string} transactionId - ID de transaction
     * @param {string} reference - Référence
     */
    async validatePaymentWithOTP(phoneNumber, amount, otp, transactionId, reference) {
        try {
            const token = await this.getSessionToken();
            
            const validateResponse = await axios.post(`${this.apiUrl}/api/v1/payments/otp/validate`, {
                phone_number: phoneNumber,
                amount: amount,
                otp: otp,
                trans_id: transactionId,
                reference_id: reference
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (validateResponse.data.status === '0') {
                logger.info(`Paiement Moov validé: ${reference}`);
                return {
                    success: true,
                    transactionId: validateResponse.data['trans-id'],
                    reference: reference,
                    status: 'success'
                };
            }
            
            return {
                success: false,
                error: validateResponse.data.message,
                code: validateResponse.data.status
            };
        } catch (error) {
            logger.error('Moov validatePaymentWithOTP error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Paiement direct (sans OTP) pour les comptes marchands
     * @param {string} phoneNumber 
     * @param {number} amount 
     * @param {string} description 
     * @param {string} reference 
     */
    async initiateDirectPayment(phoneNumber, amount, description, reference) {
        try {
            const token = await this.getSessionToken();
            
            const response = await axios.post(`${this.apiUrl}/api/v1/payments/direct`, {
                phone_number: phoneNumber,
                amount: amount,
                description: description,
                reference_id: reference,
                currency: 'XAF'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.status === '0') {
                logger.info(`Paiement direct Moov: ${reference}`);
                return {
                    success: true,
                    transactionId: response.data['trans-id'],
                    reference: reference,
                    status: 'success'
                };
            }
            
            return {
                success: false,
                error: response.data.message,
                code: response.data.status
            };
        } catch (error) {
            logger.error('Moov initiateDirectPayment error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * @param {string} reference 
     */
    async checkTransactionStatus(reference) {
        try {
            const token = await this.getSessionToken();
            
            const response = await axios.get(`${this.apiUrl}/api/v1/transactions/status/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const statusMap = {
                '0': 'success',
                '15': 'pending',
                '12': 'failed'
            };
            
            return {
                success: true,
                status: statusMap[response.data.status] || 'unknown',
                transactionId: response.data['trans-id'],
                details: response.data
            };
        } catch (error) {
            logger.error('Moov checkTransactionStatus error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Vérifier le statut d'un abonné Moov Money
     * @param {string} phoneNumber 
     */
    async checkSubscriberStatus(phoneNumber) {
        try {
            const token = await this.getSessionToken();
            
            const response = await axios.get(`${this.apiUrl}/api/v1/subscribers/${phoneNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.status === '0') {
                const subscriberData = JSON.parse(response.data['extended-data']?.data?.['subscriber-details'] || '{}');
                return {
                    success: true,
                    exists: true,
                    firstName: subscriberData.firstname,
                    lastName: subscriberData.lastname,
                    status: subscriberData.status
                };
            }
            
            return {
                success: false,
                exists: false,
                error: response.data.message
            };
        } catch (error) {
            logger.error('Moov checkSubscriberStatus error:', error.message);
            return {
                success: false,
                exists: false,
                error: error.message
            };
        }
    }
}

module.exports = new MoovMoneyService();