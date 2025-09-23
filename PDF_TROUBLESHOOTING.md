# Guide de Dépannage PDF - FloorIA

## Problème Identifié

FloorIA fonctionne parfaitement avec les images PNG/JPG mais rencontre des problèmes lors de l'analyse de plans au format PDF.

## Analyse Technique

### ✅ Ce qui fonctionne
- **Backend PDF handling** : Le code dans `main.py` (lignes 135-167) gère correctement la conversion PDF vers image
- **pdf2image** : La bibliothèque est installée et fonctionne (`requirements.txt` ligne 11)
- **poppler-utils** : Les outils système sont installés et opérationnels
- **Frontend PDF support** : Le code dans `App.vue` (lignes 250-253) gère l'image convertie

### ❌ Problèmes identifiés

1. **Dépendance incorrecte dans requirements.txt**
   - `poppler-utils>=0.1.0` est incorrect (ce n'est pas un package Python)
   - Corrigé avec des commentaires explicatifs

2. **Possible problème d'authentification**
   - L'analyse PDF nécessite une authentification valide
   - Les logs montrent des erreurs de token JWT

3. **Gestion d'erreur PDF insuffisante**
   - Pas de feedback utilisateur clair en cas d'échec de conversion PDF

## Solutions Implémentées

### 1. Correction du requirements.txt
```
pdf2image>=1.16.0
# poppler-utils is a system package, not a Python package
# Install with: sudo apt-get install poppler-utils
```

### 2. Vérification des dépendances système
```bash
# Vérifier que poppler-utils est installé
dpkg -l | grep poppler
which pdftoppm
```

### 3. Test de conversion PDF
```python
from pdf2image import convert_from_path
images = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=200)
```

## Workflow PDF dans FloorIA

1. **Upload PDF** → Frontend envoie le fichier PDF au backend
2. **Détection PDF** → Backend détecte le type MIME `application/pdf`
3. **Conversion** → `pdf2image.convert_from_path()` convertit la première page
4. **Analyse Roboflow** → L'image convertie est envoyée à l'API Roboflow
5. **Retour Frontend** → Le backend renvoie l'image convertie + détections
6. **Affichage** → Frontend utilise `result.converted_image` pour l'affichage

## Débogage

### Logs Backend à surveiller
```
📄 Processing PDF file...
🔄 Converting PDF to image...
🔍 PDF converted to image dimensions: WxH
📄 Adding converted image to response for PDF file...
✅ Converted image added to response
```

### Logs Frontend à surveiller
```
📄 PDF converted image received, updating canvas source
```

## Tests de Validation

### Test 1 : Conversion PDF locale
```bash
source backend/venv/bin/activate
python3 -c "
from pdf2image import convert_from_path
images = convert_from_path('/path/to/test.pdf', dpi=200)
print(f'Converted {len(images)} pages')
"
```

### Test 2 : API Backend
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Authorization: Bearer VALID_TOKEN" \
  -F "image=@test.pdf"
```

### Test 3 : Interface FloorIA
1. Se connecter à l'interface
2. Importer un fichier PDF
3. Vérifier les logs de conversion
4. Confirmer l'affichage de l'image convertie

## Recommandations

1. **Toujours utiliser des PDFs de qualité** avec des plans architecturaux clairs
2. **Vérifier l'authentification** avant l'analyse
3. **Surveiller les logs** pour identifier les erreurs de conversion
4. **Tester avec des PDFs simples** avant des documents complexes

## Déploiement Production

### Variables d'environnement requises
```
ROBOFLOW_API_KEY=your_key
ROBOFLOW_WORKSPACE=your_workspace
ROBOFLOW_PROJECT=your_project
ROBOFLOW_VERSION=1
```

### Installation système (Render/Railway)
```bash
# Dans le script de build
apt-get update && apt-get install -y poppler-utils
```

## Support

Si les problèmes persistent :
1. Vérifier les logs backend pour les erreurs de conversion PDF
2. Tester la conversion PDF en isolation
3. Valider l'authentification Supabase
4. Confirmer les variables d'environnement Roboflow
