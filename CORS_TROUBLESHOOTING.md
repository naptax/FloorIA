# 🌐 Guide CORS - Dépannage et Bonnes Pratiques

## ⚠️ Problème Critique : CORS et Changement d'URL

### 🔍 Symptômes
- ✅ L'application fonctionne parfaitement en **local**
- ❌ L'analyse d'image échoue en **production** sans erreur backend visible
- 🔴 Console navigateur : `Access to fetch at 'https://backend.com/analyze' from origin 'https://frontend.com' has been blocked by CORS policy`

### 🎯 Cause Racine
Le backend n'autorise que les requêtes depuis les URLs configurées dans `allow_origins`. Lors d'un changement d'URL frontend, cette liste devient obsolète.

## 🛠️ Solution Étape par Étape

### 1. Identifier l'URL Frontend Finale
Après déploiement sur Render, noter l'URL complète :
```
https://votre-app-XXXX.onrender.com
```

### 2. Mettre à Jour le Backend CORS
Dans `backend/main.py`, localiser la configuration CORS :

```python
# ❌ AVANT - URL manquante
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001"
        # ⚠️ URL production manquante !
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```python
# ✅ APRÈS - URL production ajoutée
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://votre-app-XXXX.onrender.com"  # ✅ AJOUTER ICI
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Redéployer le Backend
```bash
git add backend/main.py
git commit -m "Fix CORS: Add production frontend URL"
git push origin master
```

### 4. Vérifier la Résolution
- Attendre le redéploiement Render (~2-3 minutes)
- Tester l'analyse d'image sur la version production
- Vérifier qu'aucune erreur CORS n'apparaît dans la console

## 🔄 Checklist de Déploiement

### À Chaque Changement d'URL Frontend :
- [ ] Noter la nouvelle URL frontend
- [ ] Mettre à jour `allow_origins` dans `backend/main.py`
- [ ] Commit et push les changements
- [ ] Attendre le redéploiement backend
- [ ] Tester les fonctionnalités critiques (analyse d'image)

## 🚨 Cas d'Urgence

### Diagnostic Rapide CORS
1. **Ouvrir la console navigateur** (F12)
2. **Tenter une analyse d'image**
3. **Chercher les erreurs** contenant "CORS" ou "blocked"

### Fix Temporaire (Développement Uniquement)
⚠️ **JAMAIS en production** - Désactiver CORS temporairement :
```python
# ⚠️ DÉVELOPPEMENT SEULEMENT
allow_origins=["*"]  # Autorise toutes les origines
```

## 📋 URLs de Référence

### FloorIA Production Actuelle
- **Frontend** : https://flooria-aenm.onrender.com
- **Backend** : https://flooria.onrender.com
- **Backend Health** : https://flooria.onrender.com/health

### Environnements Locaux
- **Frontend** : http://localhost:3001
- **Backend** : http://localhost:8000

## 🎯 Bonnes Pratiques

### 1. Documentation des URLs
Maintenir une liste à jour des URLs dans ce fichier après chaque changement.

### 2. Tests Post-Déploiement
Toujours tester les fonctionnalités critiques après un changement d'URL.

### 3. Monitoring CORS
Surveiller les logs backend pour les erreurs CORS non détectées.

### 4. Environnements Multiples
Considérer l'utilisation de variables d'environnement pour les URLs CORS :
```python
import os
FRONTEND_URLS = os.getenv("CORS_ORIGINS", "http://localhost:3001").split(",")
allow_origins=FRONTEND_URLS
```

---

**💡 Rappel** : CORS est une sécurité navigateur. Le backend doit explicitement autoriser chaque origine (domaine) qui souhaite faire des requêtes.
