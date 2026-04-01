const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class AirtelMoneyService {
    constructor() {
        this.apiUrl = process.env.AIRTEL_API_URL || 'https://api.airtel.ga';
        this.merchantId = process.env.AIRTEL_MERCHANT_ID;
        this.apiKey = process.env.AIRTEL_API_KEY;
        this.apiSecret = process.env.AIRTEL_API_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Générer le token d'accès (authentification)
     */
    async getAccessToken() {
        // Vérifier si le token est encore valide
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(`${this.apiUrl}/auth/token`, {
                client_id: this.merchantId,
                client_secret: this.apiSecret,
                grant_type: 'client_credentials'
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            logger.info('Token Airtel Money obtenu');
            return this.accessToken;
        } catch (error) {
            logger.error('Airtel getAccessToken error:', error.response?.data || error.message);
            throw new Error('Impossible de s\'authentifier auprès d\'Airtel Money');
        }
    }

    /**
     * Effectuer un paiement Mobile Money (débit du client)
     * @param {string} phoneNumber - Numéro du client (format +241XXXXXXXX)
     * @param {number} amount - Montant en XAF (500 - 500,000)
     * @param {string} description - Description du paiement
     * @param {string} reference - Référence unique de transaction
     */
    async initiatePayment(phoneNumber, amount, description, reference) {
        try {
            // Validation du montant
            if (amount < 500 || amount > 500000) {
                return {
                    success: false,
                    error: `Le montant doit être entre 500 et 500,000 XAF (reçu: ${amount})`
                };
            }

            const token = await this.getAccessToken();
            
            // Format du numéro de téléphone (s'assurer du format +241)
            let formattedNumber = phoneNumber;
            if (!phoneNumber.startsWith('+')) {
                formattedNumber = `+241${phoneNumber.replace(/^0+/, '')}`;
            }

            const payload = {
                amount: {
                    currency: 'XAF',
                    value: amount.toString()
                },
                payment_account: {
                    type: 'MOBILE_MONEY',
                    country: 'GA',
                    holder: {
                        type: 'INDIVIDUAL',
                        name: 'ISMAP² Student'
                    },
                    mobile_money: {
                        operator: 'AIRTEL',
                        number: formattedNumber
                    }
                },
                purpose: 'EDUCATION',
                sender: {
                    type: 'INDIVIDUAL',
                    name: 'ISMAP²',
                    address: {
                        line_1: 'Angondjé Château',
                        line_2: 'Complexe scolaire Pathy School',
                        city: 'Libreville',
                        postal_code: 'BP 1234',
                        country: 'GA'
                    },
                    individual: {
                        dob: '1980-01-01',
                        identity_document: {
                            type: 'PASSPORT',
                            country: 'GA',
                            number: 'ISMAP2026001',
                            expires_on: '2030-12-31'
                        }
                    }
                },
                reference_id: reference,
                description: description
            };

            const response = await axios.post(`${this.apiUrl}/payments`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Request-ID': crypto.randomUUID()
                }
            });

            logger.info(`Paiement Airtel initié: ${reference} - ${amount} XAF`);
            
            return {
                success: true,
                transactionId: response.data.id,
                status: response.data.status,
                reference: reference
            };
        } catch (error) {
            logger.error('Airtel initiatePayment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                code: error.response?.data?.code
            };
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * @param {string} reference - Référence de transaction
     */
    async checkPaymentStatus(reference) {
        try {
            const token = await this.getAccessToken();
            
            const response = await axios.get(`${this.apiUrl}/payments/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const statusMap = {
                'SUCCESS': 'success',
                'PENDING': 'pending',
                'FAILED': 'failed',
                'CANCELLED': 'cancelled'
            };
            
            return {
                success: true,
                status: statusMap[response.data.status] || 'unknown',
                transactionId: response.data.id,
                amount: response.data.amount?.value,
                details: response.data
            };
        } catch (error) {
            logger.error('Airtel checkPaymentStatus error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Annuler un paiement en attente
     * @param {string} reference 
     */
    async cancelPayment(reference) {
        try {
            const token = await this.getAccessToken();
            
            const response = await axios.delete(`${this.apiUrl}/payments/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return {
                success: true,
                message: 'Paiement annulé avec succès'
            };
        } catch (error) {
            logger.error('Airtel cancelPayment error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new AirtelMoneyService();