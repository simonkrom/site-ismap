# Guide de Déploiement - ISMAP² sur Heroku

## Prérequis
- Heroku CLI installé: https://devcenter.heroku.com/articles/heroku-cli
- Compte Heroku gratuit: https://www.heroku.com

## Étapes de déploiement

### 1. Créer une app Heroku
```powershell
heroku login
heroku create nom-de-votre-app
```

### 2. Ajouter MySQL
```powershell
heroku addons:create jawsdb:kitefin
```

### 3. Configurer les variables d'environnement
```powershell
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_clé_secrète_ici
heroku config:set SMTP_USER=votre_email@gmail.com
heroku config:set SMTP_PASSWORD=votre_mot_de_passe
# ... etc
```

### 4. Vérifier les variables
```powershell
heroku config
```

### 5. Déployer
```powershell
git push heroku main
```

### 6. Initialiser la base de données
```powershell
heroku run "cd backend && npm run migrate"
```

### 7. Consulter les logs
```powershell
heroku logs --tail
```

## Variables d'environnement essentielles

Voir `.env.example` pour la liste complète.

Les variables sont automatiquement définies par Heroku pour JawsDB:
- `JAWSDB_URL` - Lien de connexion complet

## Troubleshooting

- **Erreur de port**: Heroku assigne le PORT automatiquement
- **Erreur de base de données**: Vérifier `heroku config` pour les identifiants
- **Erreur de déploiement**: Consulter `heroku logs --tail`

## Mise à jour du code

Après des modifications:
```powershell
git add .
git commit -m "Votre message"
git push origin main
git push heroku main
```
