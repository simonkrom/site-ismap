# Configuration SingPay - Variables d'Environnement

Ajoutez les variables suivantes à votre fichier `.env` du backend :

```env
# ===== SingPay Configuration =====
# API de paiement unifiée pour Airtel Money et Moov Money
# Documentation: https://client.singpay.ga/doc/reference/index.html

# URL de base de l'API SingPay
SINGPAY_API_URL=https://gateway.singpay.ga/v1

# Client ID pour l'authentification OAuth 2.0
SINGPAY_CLIENT_ID=your_client_id_here

# Client Secret pour l'authentification OAuth 2.0
SINGPAY_CLIENT_SECRET=your_client_secret_here

# ID du portefeuille (Wallet ID à récupérer dans le dashboard SingPay)
SINGPAY_WALLET_ID=your_wallet_id_here

# ID de distribution (Disbursement ID - pour production)
# Leave empty for development
SINGPAY_DISBURSEMENT_ID=your_disbursement_id_here

# URL de callback pour les notifications de paiement
# Exemple: https://votre-domaine.com/api/paiements/singpay-webhook
SINGPAY_CALLBACK_URL=http://localhost:3000/api/paiements/singpay-webhook
```

## Configuration du Dashboard SingPay

1. **Créer un portefeuille (Wallet)** :
   - Accédez à https://singpay.ga (ou le dashboard de votre région)
   - Créez un compte marchand
   - Créez un portefeuille
   - Récupérez le `Wallet ID` depuis les détails du portefeuille

2. **Générer les clés API** :
   - Dans les paramètres du compte, créez une application
   - Récupérez le `client_id` et `client_secret`
   - Sauvegardez ces valeurs dans votre `.env`

3. **Configurer le Callback URL** :
   - Dans les paramètres du portefeuille, définissez l'URL de callback
   - Utilisez : `https://votre-domaine.com/api/paiements/singpay-webhook`
   - En développement local, vous pouvez utiliser un tunnel ngrok

4. **Créer une distribution** (en production) :
   - Configurez où les fonds doivent être envoyés
   - Récupérez le `Disbursement ID`
   - Ajoutez-le dans `SINGPAY_DISBURSEMENT_ID`

## Options de Paiement Supportées

### Airtel Money
- **Endpoint** : `POST /74/paiement`
- **Format de numéro** : Format international (ex: +237XXXXXXXXX)

### Moov Money
- **Endpoint** : `POST /62/paiement`
- **Format de numéro** : Format international (ex: +229XXXXXXXXX)

## Statuts de Transaction SingPay

- **Start** : Transaction initiée
- **Partenaire** : En attente de l'opérateur
- **Terminate** : Transaction finalisée
- **Disbursement** : Fond distribué
- **Refund** : Remboursement effectué

## Résultats de Paiement

- **Success** : Paiement réussi
- **PasswordError** : Mauvais mot de passe
- **BalanceError** : Solde insuffisant
- **TimeOutError** : Délai dépassé
- **Error** : Erreur générique
