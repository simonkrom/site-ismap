const axios = require('axios');
const logger = require('../utils/logger');

class SingpayService {
    constructor() {
        this.baseURL = process.env.SINGPAY_API_URL || 'https://gateway.singpay.ga/v1';
        this.clientId = process.env.SINGPAY_CLIENT_ID;
        this.clientSecret = process.env.SINGPAY_CLIENT_SECRET;
        this.walletId = process.env.SINGPAY_WALLET_ID;
        this.disbursementId = process.env.SINGPAY_DISBURSEMENT_ID;
        
        if (!this.clientId || !this.clientSecret || !this.walletId) {
            throw new Error('Variables d\'environnement SingPay non configurées');
        }

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': this.clientId,
                'x-client-secret': this.clientSecret,
                'x-wallet': this.walletId
            }
        });
    }

    /**
     * Lancer un paiement Airtel Money via USSD Push
     * @param {object} paymentData
     * @returns {Promise}
     */
    async initiateAirtelMoneyPayment(paymentData) {
        try {
            const {
                amount,
                phoneNumber,
                reference,
                description,
                isTransfer = false
            } = paymentData;

            const payload = {
                amount: parseInt(amount),
                reference: reference || this.generateReference(),
                client_msisdn: phoneNumber,
                portefeuille: this.walletId,
                disbursement: this.disbursementId || '',
                isTransfer
            };

            logger.info('Initiating Airtel Money payment:', { reference: payload.reference, amount });

            const response = await this.client.post('/74/paiement', payload);

            return {
                success: response.data.status?.success || false,
                transactionId: response.data.transaction?.id,
                transactionReference: response.data.transaction?.reference,
                code: response.data.status?.code,
                message: response.data.status?.message,
                data: response.data
            };
        } catch (error) {
            logger.error('Airtel Money payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.status?.message || 'Erreur lors du paiement Airtel Money',
                code: error.response?.status
            };
        }
    }

    /**
     * Lancer un paiement Moov Money via USSD Push
     * @param {object} paymentData
     * @returns {Promise}
     */
    async initiateMoovMoneyPayment(paymentData) {
        try {
            const {
                amount,
                phoneNumber,
                reference,
                description,
                isTransfer = false
            } = paymentData;

            const payload = {
                amount: parseInt(amount),
                reference: reference || this.generateReference(),
                client_msisdn: phoneNumber,
                portefeuille: this.walletId,
                disbursement: this.disbursementId || '',
                isTransfer
            };

            logger.info('Initiating Moov Money payment:', { reference: payload.reference, amount });

            const response = await this.client.post('/62/paiement', payload);

            return {
                success: response.data.status?.success || false,
                transactionId: response.data.transaction?.id,
                transactionReference: response.data.transaction?.reference,
                code: response.data.status?.code,
                message: response.data.status?.message,
                data: response.data
            };
        } catch (error) {
            logger.error('Moov Money payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.status?.message || 'Erreur lors du paiement Moov Money',
                code: error.response?.status
            };
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * @param {string} transactionId
     * @returns {Promise}
     */
    async checkTransactionStatus(transactionId) {
        try {
            logger.info('Checking transaction status:', { transactionId });

            const response = await this.client.get(`/transaction/api/status/${transactionId}`);

            return {
                success: response.data.status?.success || false,
                transactionId: response.data.transaction?.id,
                status: response.data.transaction?.status,
                result: response.data.transaction?.result,
                amount: response.data.transaction?.amount,
                reference: response.data.transaction?.reference,
                code: response.data.status?.code,
                message: response.data.status?.message,
                data: response.data
            };
        } catch (error) {
            logger.error('Check transaction status error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Erreur lors de la vérification du statut',
                code: error.response?.status
            };
        }
    }

    /**
     * Récupérer les informations d'une transaction par référence
     * @param {string} reference
     * @returns {Promise}
     */
    async getTransactionByReference(reference) {
        try {
            logger.info('Getting transaction by reference:', { reference });

            const response = await this.client.get(`/transaction/api/search/by-reference/${reference}`);

            return {
                success: response.data.status?.success || false,
                transactionId: response.data.transaction?.id,
                status: response.data.transaction?.status,
                result: response.data.transaction?.result,
                amount: response.data.transaction?.amount,
                reference: response.data.transaction?.reference,
                code: response.data.status?.code,
                message: response.data.status?.message,
                data: response.data
            };
        } catch (error) {
            logger.error('Get transaction by reference error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Erreur lors de la récupération de la transaction',
                code: error.response?.status
            };
        }
    }

    /**
     * Générer une référence unique
     * @returns {string}
     */
    generateReference() {
        return `ISMAP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
}

module.exports = new SingpayService();
