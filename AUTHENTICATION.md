# FloorIA Authentication Guide with Supabase

## Overview

FloorIA v1.4.0 integrates a complete authentication system based on Supabase, allowing users to create accounts, log in, and manage their sessions securely.

## Supabase Configuration (Administrators)

### 1. Creating the Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the project URL and anonymous key (anon key)

### 2. Authentication Configuration

In the Supabase dashboard:

1. **Authentication > Settings**
   - Enable email authentication
   - Configure email templates (optional)
   - Set redirect URLs if necessary

2. **Authentication > Providers**
   - Ensure "Email" is enabled
   - Configure other providers if desired (Google, GitHub, etc.)

### 3. Creating the profiles table

Execute this SQL query in the Supabase SQL editor:

```sql
-- Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow insertion of new profiles
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create a profile upon registration
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

-- Trigger to execute the function upon registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Environment Variables Configuration

In the backend `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_TOKEN=your_supabase_anon_key
```

Create a frontend `.env` file (never commit this file!):

```env
# Frontend .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

The `supabaseClient.ts` file automatically uses these environment variables:

```typescript
// Secure configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
```

## Usage for Users

### 1. Registration

1. Open FloorIA in your browser
2. Click the "Login" button in the toolbar
3. In the modal that opens, click "Sign Up"
4. Fill out the form:
   - **Email**: Your email address (required)
   - **Full Name**: Your name (optional)
   - **Password**: A secure password (required)
5. Click "Sign Up"
6. Check your email to confirm your account

### 2. Login

1. Click the "Login" button in the toolbar
2. Enter your email and password
3. Click "Login"
4. You are now logged in and your name/avatar appears in the toolbar

### 3. Logout

1. Click the "Logout" button next to your name in the toolbar
2. You are automatically logged out

### 4. Authentication Features

Once logged in, you benefit from:
- **Session persistence**: You stay logged in even after closing the browser
- **User profile**: Your information is saved
- **Secure access**: Some future features may be reserved for logged-in users

## Authentication API (Developers)

### Backend Endpoints

#### POST `/auth/signup`
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Name" // optional
}
```

#### POST `/auth/login`
Login an existing user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/auth/logout`
Logout the current user.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/auth/me`
Retrieve current user information.

**Headers:**
```
Authorization: Bearer <token>
```

### Endpoint Protection

To protect an endpoint, use the authentication middleware:

```python
from auth_middleware import require_auth

@app.get("/protected-endpoint")
async def protected_route(user: Dict[str, Any] = Depends(require_auth)):
    return {"message": f"Hello {user['email']}!"}
```

### Frontend Client

```typescript
import { authManager } from './supabaseClient';

// Check if user is authenticated
const isAuthenticated = authManager.isAuthenticated();

// Get current user
const currentUser = authManager.getCurrentUser();

// Get authentication token
const token = authManager.getAuthToken();

// Listen to authentication state changes
const unsubscribe = authManager.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user);
  } else {
    console.log('User logged out');
  }
});
```

## Security

### Best Practices

1. **Passwords**: Encourage users to use strong passwords
2. **HTTPS**: Always use HTTPS in production
3. **Tokens**: Access tokens are automatically managed and renewed
4. **Environment Variables**: Never expose secret keys in code
5. **Frontend Security**: 
   - Always use `.env` files for Supabase credentials
   - Never hardcode API keys in source code
   - Ensure `.env` files are in `.gitignore`
   - Only use public/anon keys in frontend (never service role keys)
   - Frontend environment variables are visible to users - only use public keys

### Row Level Security (RLS)

Supabase uses RLS to ensure that:
- Users can only access their own data
- Operations are automatically filtered by user
- Security is enforced at the database level

## Troubleshooting

### Common Issues

1. **Supabase connection error**
   - Check that SUPABASE_URL and SUPABASE_TOKEN variables are correctly configured
   - Ensure the Supabase project is active

2. **Confirmation email not received**
   - Check spam folder
   - Ensure email authentication is enabled in Supabase

3. **"Invalid credentials" error**
   - Check that email and password are correct
   - Ensure the account has been confirmed via email

4. **Expired token**
   - Tokens are automatically renewed
   - If there's an issue, log out and log back in

### Logs and Debugging

- Authentication errors are logged in the browser console
- Backend errors are visible in server logs
- Use Supabase development tools to monitor authentication

## Support

For any questions or issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review error logs
3. Contact the FloorIA development team

---

*FloorIA v1.4.0 - Supabase Authentication System*
