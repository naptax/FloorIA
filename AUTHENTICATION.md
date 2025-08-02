# Guide d'Authentification FloorIA avec Supabase

## Vue d'ensemble

FloorIA v1.4.0 intègre un système d'authentification complet basé sur Supabase, permettant aux utilisateurs de créer des comptes, se connecter et gérer leurs sessions de manière sécurisée.

## Configuration Supabase (Administrateurs)

### 1. Création du projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé anonyme (anon key)

### 2. Configuration de l'authentification

Dans le dashboard Supabase :

1. **Authentication > Settings**
   - Activez l'authentification par email
   - Configurez les templates d'email (optionnel)
   - Définissez les URLs de redirection si nécessaire

2. **Authentication > Providers**
   - Assurez-vous que "Email" est activé
   - Configurez d'autres providers si souhaité (Google, GitHub, etc.)

### 3. Création de la table profiles

Exécutez cette requête SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer la table profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour exécuter la fonction lors de l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Configuration des variables d'environnement

Dans le fichier `.env` du backend :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_TOKEN=votre_cle_anonyme_supabase
```

Dans le fichier `supabaseClient.ts` du frontend :

```typescript
const supabaseUrl = 'https://votre-projet.supabase.co';
const supabaseAnonKey = 'votre_cle_anonyme_supabase';
```

## Utilisation pour les utilisateurs

### 1. Inscription

1. Ouvrez FloorIA dans votre navigateur
2. Cliquez sur le bouton "Se connecter" dans la barre d'outils
3. Dans la modal qui s'ouvre, cliquez sur "S'inscrire"
4. Remplissez le formulaire :
   - **Email** : Votre adresse email (obligatoire)
   - **Nom complet** : Votre nom (optionnel)
   - **Mot de passe** : Un mot de passe sécurisé (obligatoire)
5. Cliquez sur "S'inscrire"
6. Vérifiez votre email pour confirmer votre compte

### 2. Connexion

1. Cliquez sur le bouton "Se connecter" dans la barre d'outils
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"
4. Vous êtes maintenant connecté et votre nom/avatar apparaît dans la barre d'outils

### 3. Déconnexion

1. Cliquez sur le bouton "Déconnexion" à côté de votre nom dans la barre d'outils
2. Vous êtes automatiquement déconnecté

### 4. Fonctionnalités avec authentification

Une fois connecté, vous bénéficiez de :
- **Persistance de session** : Vous restez connecté même après fermeture du navigateur
- **Profil utilisateur** : Vos informations sont sauvegardées
- **Accès sécurisé** : Certaines fonctionnalités futures pourront être réservées aux utilisateurs connectés

## API d'authentification (Développeurs)

### Endpoints backend

#### POST `/auth/signup`
Inscription d'un nouvel utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "full_name": "Nom Utilisateur" // optionnel
}
```

#### POST `/auth/login`
Connexion d'un utilisateur existant.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

#### POST `/auth/logout`
Déconnexion de l'utilisateur actuel.

**Headers :**
```
Authorization: Bearer <token>
```

#### GET `/auth/me`
Récupération des informations de l'utilisateur actuel.

**Headers :**
```
Authorization: Bearer <token>
```

### Protection des endpoints

Pour protéger un endpoint, utilisez le middleware d'authentification :

```python
from auth_middleware import require_auth

@app.get("/protected-endpoint")
async def protected_route(user: Dict[str, Any] = Depends(require_auth)):
    return {"message": f"Hello {user['email']}!"}
```

### Client frontend

```typescript
import { authManager } from './supabaseClient';

// Vérifier si l'utilisateur est connecté
const isAuthenticated = authManager.isAuthenticated();

// Obtenir l'utilisateur actuel
const currentUser = authManager.getCurrentUser();

// Obtenir le token d'authentification
const token = authManager.getAuthToken();

// Écouter les changements d'état d'authentification
const unsubscribe = authManager.onAuthStateChange((user) => {
  if (user) {
    console.log('Utilisateur connecté:', user);
  } else {
    console.log('Utilisateur déconnecté');
  }
});
```

## Sécurité

### Bonnes pratiques

1. **Mots de passe** : Encouragez les utilisateurs à utiliser des mots de passe forts
2. **HTTPS** : Utilisez toujours HTTPS en production
3. **Tokens** : Les tokens d'accès sont automatiquement gérés et renouvelés
4. **Variables d'environnement** : Ne jamais exposer les clés secrètes dans le code

### Row Level Security (RLS)

Supabase utilise RLS pour s'assurer que :
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les opérations sont automatiquement filtrées par utilisateur
- La sécurité est appliquée au niveau de la base de données

## Dépannage

### Problèmes courants

1. **Erreur de connexion Supabase**
   - Vérifiez que les variables SUPABASE_URL et SUPABASE_TOKEN sont correctement configurées
   - Assurez-vous que le projet Supabase est actif

2. **Email de confirmation non reçu**
   - Vérifiez les spams
   - Assurez-vous que l'authentification par email est activée dans Supabase

3. **Erreur "Invalid credentials"**
   - Vérifiez que l'email et le mot de passe sont corrects
   - Assurez-vous que le compte a été confirmé par email

4. **Token expiré**
   - Les tokens sont automatiquement renouvelés
   - En cas de problème, déconnectez-vous et reconnectez-vous

### Logs et debugging

- Les erreurs d'authentification sont loggées dans la console du navigateur
- Les erreurs backend sont visibles dans les logs du serveur
- Utilisez les outils de développement Supabase pour monitorer l'authentification

## Support

Pour toute question ou problème :
1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs d'erreur
3. Contactez l'équipe de développement FloorIA

---

*FloorIA v1.4.0 - Système d'authentification Supabase*
