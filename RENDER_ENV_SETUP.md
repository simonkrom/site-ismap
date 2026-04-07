# Configuration Render - Variables d'environnement

## 📋 Variables essentielles à configurer

### 1. Dans Render Dashboard
Allez dans votre service web > **Environment** et ajoutez ces variables :

### Serveur
```
NODE_ENV=production
PORT=8000
```

### Base de données
```
DATABASE_URL=mysql://user:password@host:port/database
```
*(Fournie automatiquement par Render quand vous créez la DB)*

### JWT
```
JWT_SECRET=a7f3c9e2b1d8f4a6c5e9b2d1f4a7c3e8b9f2d5a8c1e4f7b0d3a6c9e2f1b4d7
JWT_EXPIRE=7d
```

### Email
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nzong.simon@gmail.com
SMTP_PASSWORD=Rogernida4
SMTP_FROM=ISMAP² <no-reply@ismap2.com>
```

### URLs
```
API_URL=https://votre-app.onrender.com
```
*(Remplacez par votre vraie URL Render)*

## 🔐 Variables de paiement (optionnelles - à configurer plus tard)

### Stripe
Obtenez vos clés sur https://dashboard.stripe.com/apikeys
```
STRIPE_SECRET_KEY=votre_clé_secrète_stripe
STRIPE_PUBLIC_KEY=votre_clé_publique_stripe
STRIPE_WEBHOOK_SECRET=votre_secret_webhook_stripe
```

### Airtel Money
```
AIRTEL_API_URL=https://api.airtel.ga
AIRTEL_MERCHANT_ID=ISMAP_001
AIRTEL_API_KEY=votre_clé_api_airtel
AIRTEL_API_SECRET=votre_secret_api_airtel
```

### Moov Money
```
MOOV_API_URL=https://api.moov.ga
MOOV_USERNAME=votre_username
MOOV_PASSWORD=votre_password
MOOV_MERCHANT_ID=ISMAP_001
MOOV_API_KEY=votre_clé_api_moov
```

### SingPay
```
SINGPAY_API_URL=https://gateway.singpay.ga/v1
SINGPAY_CLIENT_ID=votre_client_id
SINGPAY_CLIENT_SECRET=votre_client_secret
SINGPAY_WALLET_ID=votre_wallet_id
SINGPAY_DISBURSEMENT_ID=votre_disbursement_id
```

## ⚠️ Important

- **Ne jamais committer** les vraies clés dans le code
- **Utilisez des clés de production** pour les paiements
- **Testez** l'app après configuration
- **Vérifiez les logs** en cas d'erreur

## 📝 Fichier de référence

Voir `.env.render` pour un exemple complet de configuration.