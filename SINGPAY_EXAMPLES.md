# 🧪 Exemples de Requêtes - SingPay Integration

## 1. Initier un Paiement Airtel Money via SingPay

```bash
curl -X POST http://localhost:3000/api/paiements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "etudiant_id": 1,
    "formation_id": 1,
    "montant": 50000,
    "methode": "singpay",
    "operateur": "airtel",
    "phoneNumber": "+237690000001",
    "description": "Paiement frais de scolarité"
  }'
```

### Réponse Successful:
```json
{
  "success": true,
  "data": {
    "paiement": {
      "id": 123,
      "reference": "ISMAP-1712057400000-abc123",
      "etudiant_id": 1,
      "formation_id": 1,
      "montant": 50000,
      "methode": "singpay",
      "operateur": "airtel",
      "numero_transaction": "SINGPAY-xxxx",
      "statut": "pending",
      "date_paiement": "2026-04-02T10:30:00.000Z"
    },
    "transactionId": "SINGPAY-xxxx",
    "clientSecret": null,
    "message": "Payment initiated successfully"
  }
}
```

---

## 2. Initier un Paiement Moov Money via SingPay

```bash
curl -X POST http://localhost:3000/api/paiements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "etudiant_id": 2,
    "formation_id": 1,
    "montant": 75000,
    "methode": "singpay",
    "operateur": "moov",
    "phoneNumber": "+22968000001",
    "description": "Paiement frais de scolarité"
  }'
```

---

## 3. Vérifier le Statut d'une Transaction

```bash
curl -X GET http://localhost:3000/api/paiements/status/ISMAP-1712057400000-abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Réponse:
```json
{
  "success": true,
  "transactionId": "SINGPAY-xxxx",
  "status": "Terminate",
  "result": "Success",
  "amount": "50000",
  "reference": "ISMAP-1712057400000-abc123",
  "data": {
    "transaction": {
      "id": "SINGPAY-xxxx",
      "status": "Terminate",
      "result": "Success",
      "amount": "50000"
    },
    "status": {
      "code": "200",
      "message": "Transaction successful",
      "success": true,
      "result_code": "0"
    }
  }
}
```

---

## 4. Webhook Callback de SingPay

Quand une transaction est complétée, SingPay envoie un callback à votre endpoint:

```bash
POST /api/paiements/singpay-webhook
Content-Type: application/json

{
  "reference": "ISMAP-1712057400000-abc123",
  "id": "SINGPAY-xxxx",
  "status": "Terminate",
  "result": "Success"
}
```

### Réponse attendue:
```json
{
  "received": true
}
```

---

## 5. Faire un Test de Paiement du Frontend

1. Ouvrez `http://localhost:3000/public/paiement.html`
2. Sélectionnez "SingPay"
3. Choisissez l'opérateur (Airtel ou Moov)
4. Entrez le numéro de téléphone
5. Cliquez "Payer"

Le frontend enverra une requête POST à `/api/paiements` avec les données.

---

## 📊 Format des Messages d'Erreur

### Exemple 1: Opérateur non sélectionné
```json
{
  "success": false,
  "message": "Veuillez sélectionner un opérateur (Airtel ou Moov)"
}
```

### Exemple 2: Numéro invalide
```json
{
  "success": false,
  "message": "Veuillez entrer un numéro de téléphone valide"
}
```

### Exemple 3: Paiement via API échoué
```json
{
  "success": false,
  "error": "Erreur lors du paiement Airtel Money",
  "code": "500"
}
```

---

## 🔐 Authentification

Tous les endpoints (sauf webhooks) nécessitent un JWT token:

```bash
# Header requis:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧩 Structure de la Requête de Paiement

```typescript
interface PaymentRequest {
  etudiant_id: number;        // ID de l'étudiant
  formation_id: number;       // ID de la formation
  montant: number;            // Montant en XAF
  methode: "singpay";         // Type de paiement
  operateur: "airtel" | "moov"; // Opérateur
  phoneNumber: string;        // Numéro au format international
  description?: string;       // Description optionnelle
}
```

---

## 💾 Base de Données - Table Paiement

```sql
INSERT INTO paiements (
  reference,
  etudiant_id,
  formation_id,
  montant,
  methode,
  operateur,
  numero_transaction,
  statut,
  frais_inscription,
  frais_scolarite,
  frais_dossier,
  date_paiement
) VALUES (
  'ISMAP-1712057400000-abc123',
  1,
  1,
  50000,
  'singpay',
  'airtel',
  'SINGPAY-xxxx',
  'success',
  10000,
  30000,
  10000,
  NOW()
);
```

---

## 🚨 Statuts de Paiement

| Statut | Signification |
|--------|---------------|
| `pending` | En attente de confirmation |
| `success` | ✅ Paiement réussi |
| `failed` | ❌ Paiement échoué |
| `cancelled` | Annulé par l'utilisateur |

---

## 📱 Formats de Numéros Valides

### Airtel Money (Cameroun)
- Format: `+237XXXXXXXXX` ou `+237XXXXXXXX`
- Exemple: `+237690000001`

### Moov Money (Bénin)
- Format: `+229XXXXXXXXX` ou `+229XXXXXXXX`
- Exemple: `+22968000001`

---

## 🔄 Résultats Possibles de Transaction

| Résultat | Code | Description |
|----------|------|-------------|
| `Success` | 0 | ✅ Paiement réussi |
| `PasswordError` | 1 | ❌ Mauvais mot de passe |
| `BalanceError` | 2 | ❌ Solde insuffisant |
| `TimeOutError` | 3 | ❌ Délai d'expiration |
| `Error` | 4 | ❌ Erreur générique |

---

## 📝 Logging

Le service SingPay log toutes les opérations:

```javascript
logger.info('Initiating Airtel Money payment:', { reference, amount });
logger.error('Airtel Money payment error:', errorMessage);
```

Consultez `logs/app.log` pour les détails complets.

---

## 🧪 Test Unitaire Recommandé

```javascript
const singpayService = require('../services/singpayService');

describe('SingPay Payment Service', () => {
  it('should initiate Airtel Money payment', async () => {
    const result = await singpayService.initiateAirtelMoneyPayment({
      amount: 50000,
      phoneNumber: '+237690000001',
      reference: 'TEST-12345',
      description: 'Test payment'
    });
    
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
  });
  
  it('should initiate Moov Money payment', async () => {
    const result = await singpayService.initiateMoovMoneyPayment({
      amount: 50000,
      phoneNumber: '+22968000001',
      reference: 'TEST-12345',
      description: 'Test payment'
    });
    
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
  });
  
  it('should check transaction status', async () => {
    const result = await singpayService.checkTransactionStatus('SINGPAY-xxxx');
    
    expect(result.success).toBe(true);
    expect(result.status).toBeDefined();
  });
});
```

---

**Dernière mise à jour** : 2 avril 2026
