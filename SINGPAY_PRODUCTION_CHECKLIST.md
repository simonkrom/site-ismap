# 📋 Checklist de Mise en Production - SingPay

## 1️⃣ Préparation de l'Environnement

- [ ] Obtenir les clés SingPay (client_id, client_secret)
- [ ] Obtenir le Wallet ID
- [ ] Configurer le Disbursement ID définitif (en production)
- [ ] Générer un URL public fixe pour le webhook (ex: https://api.ismap.ga)
- [ ] Configurer un certificat SSL/HTTPS

## 2️⃣ Configuration du Backend

- [ ] Créer un fichier `.env` en production (ne pas oublier !)
- [ ] Ajouter toutes les variables SingPay:
  ```env
  SINGPAY_API_URL=https://gateway.singpay.ga/v1
  SINGPAY_CLIENT_ID=prod_client_id
  SINGPAY_CLIENT_SECRET=prod_client_secret
  SINGPAY_WALLET_ID=prod_wallet_id
  SINGPAY_DISBURSEMENT_ID=prod_disbursement_id
  SINGPAY_CALLBACK_URL=https://api.ismap.ga/api/paiements/singpay-webhook
  ```
- [ ] Installer les dépendances: `npm install`
- [ ] Vérifier que `singpayService.js` est bien chargé
- [ ] Tester les logs: `npm test`

## 3️⃣ Configuration du Dashboard SingPay

### Portefeuille (Wallet)
- [ ] Vérifier le Wallet ID
- [ ] Configurer l'URL de callback: `https://api.ismap.ga/api/paiements/singpay-webhook`
- [ ] Activer les notifications par email

### Distributions (Disbursement)
- [ ] Créer une distribution pour les revenus
- [ ] Configurer le compte bancaire pour les virements
- [ ] Tester le processus de distribution

### Paramètres
- [ ] Vérifier les frais de transaction
- [ ] Configurer les limites de montant
- [ ] Activer les deux opérateurs (Airtel Money + Moov Money)

## 4️⃣ Test d'Intégration

### Test 1: Paiement Airtel Money
```bash
curl -X POST https://api.ismap.ga/api/paiements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "etudiant_id": 1,
    "formation_id": 1,
    "montant": 50000,
    "methode": "singpay",
    "operateur": "airtel",
    "phoneNumber": "+237XXXXX"
  }'
```
- [ ] Requête acceptée
- [ ] Réponse avec transaction ID
- [ ] Utilisateur reçoit USSD
- [ ] Webhook callback reçu
- [ ] Base de données mise à jour

### Test 2: Paiement Moov Money
```bash
curl -X POST https://api.ismap.ga/api/paiements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "etudiant_id": 1,
    "formation_id": 1,
    "montant": 50000,
    "methode": "singpay",
    "operateur": "moov",
    "phoneNumber": "+229XXXXX"
  }'
```
- [ ] Requête acceptée
- [ ] Réponse avec transaction ID
- [ ] Utilisateur reçoit USSD
- [ ] Webhook callback reçu
- [ ] Base de données mise à jour

### Test 3: Vérification du Webhook
- [ ] Endpoint `/api/paiements/singpay-webhook` accessible
- [ ] HTTPS utilisé (pas de HTTP)
- [ ] Application reçoit les notifications SingPay
- [ ] Logs enregistrent les webhooks

### Test 4: Vérification du Statut
```bash
curl -X GET https://api.ismap.ga/api/paiements/status/ISMAP-xxxx \
  -H "Authorization: Bearer TOKEN"
```
- [ ] Réponse rapide
- [ ] Statut correct affiché
- [ ] Détails de la transaction affichés

## 5️⃣ Configuration du Frontend

- [ ] Vérifier que l'URL de l'API backend est correcte
- [ ] Tester le formulaire SingPay sur la page paiement.html
- [ ] Vérifier que les options Airtel/Moov s'affichent
- [ ] Tester la validation des numéros de téléphone
- [ ] Vérifier les messages d'erreur

## 6️⃣ Sécurité

- [ ] HTTPS obligatoire (SSL/TLS)
- [ ] Rate limiting activé (max 10 requêtes/min par IP)
- [ ] Validation des inputs côté serveur
- [ ] Secrets non exposés dans les logs
- [ ] CORS configuré correctement
- [ ] CSRF tokens vérifiés

## 7️⃣ Monitoring et Logs

- [ ] Logs configurés pour enregistrer les transactions
- [ ] Logs SingPay stockés séparément
- [ ] Alertes configurées pour les erreurs
- [ ] Monitoring du webhook activé
- [ ] Backup des logs configuré

## 8️⃣ Email et Notifications

- [ ] Service email configuré pour les reçus
- [ ] Template email SingPay préparé
- [ ] Test d'envoi d'email effectué
- [ ] SMS optionnel configuré (si disponible)

## 9️⃣ Performance

- [ ] Cache des portées activé (axios interceptor)
- [ ] Requêtes asynchrones optimisées
- [ ] Timeouts configurés (30s max)
- [ ] CDN configuré pour les assets statiques
- [ ] Compression GZIP activée

## 🔟 Backup & Récupération

- [ ] Backup quotidien de la base de données
- [ ] Réplication des données activée
- [ ] Plan de récupération d'urgence documenté
- [ ] Test de restauration effectué

## 1️⃣1️⃣ Formation de l'Équipe

- [ ] L'équipe connaît le processus de paiement SingPay
- [ ] Documentation accessible à tous
- [ ] Support SingPay et contacts enregistrés
- [ ] FAQ préparée pour les utilisateurs

## 1️⃣2️⃣ Go-Live

- [ ] Une dernière vérification de tous les tests
- [ ] Notification aux utilisateurs du lancement
- [ ] Support disponible 24/7
- [ ] Monitoring actif le jour du lancement

---

## 📝 Checklist Post-Lancement (7 jours)

- [ ] 0 erreur en production
- [ ] Tous les webhooks reçus correctement
- [ ] Utilisateurs satisfaits
- [ ] Performance acceptable
- [ ] Aucun problème de sécurité
- [ ] Documentation actualisée

---

## 🆘 Troubleshooting Courant

### Erreur: "SINGPAY_CLIENT_ID not configured"
**Solution**: Vérifier le fichier `.env` et redémarrer le serveur

### Webhook non reçu
**Solution**: 
- Vérifier l'URL dans le dashboard SingPay
- Tester la connectivité HTTPS
- Vérifier les logs du serveur

### Erreur "Numéro invalide"
**Solution**: 
- Vérifier le format: +XXX... 
- Essayer avec un autre numéro
- Contacter le support SingPay

### Transaction "Timeout"
**Solution**:
- L'utilisateur prend trop de temps
- Relancer la transaction
- Consulter SingPay pour les détails

---

## 📞 Contacts Importants

| Service | Contact | Notes |
|---------|---------|-------|
| SingPay Support | support@singpay.ga | Support technique |
| SingPay Dashboard | https://singpay.ga | Gestion du portefeuille |
| Airtel Money | support.airtel.ga | Support opérateur |
| Moov Money | support.moov.ga | Support opérateur |

---

## 📚 Ressources Utiles

- [Documentation SingPay Complète](https://client.singpay.ga/doc/reference/index.html)
- [Guide de Configuration](./SINGPAY_SETUP.md)
- [Exemples de Requêtes](./SINGPAY_EXAMPLES.md)
- [Résumé d'Intégration](./INTEGRATION_SINGPAY_SUMMARY.md)

---

✅ **Une fois tous les points cochés, vous êtes prêt pour la production !**

*Date de révision: 2 avril 2026*
