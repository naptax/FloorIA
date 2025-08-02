# Supabase Administration Guide for FloorIA

This guide explains how to manage users, roles, and authentication settings using the Supabase dashboard for the FloorIA application.

**⚠️ IMPORTANT**: Public user registration is **DISABLED** for security reasons. All user accounts must be created by administrators through the Supabase dashboard as described in this guide.

## Table of Contents

- [Account Creation Overview](#account-creation-overview)
- [Creating User Accounts](#creating-user-accounts)
- [Setting Up the First Administrator](#setting-up-the-first-administrator)
- [Accessing the Supabase Dashboard](#accessing-the-supabase-dashboard)
- [User Management](#user-management)
- [Role Management](#role-management)
- [Authentication Settings](#authentication-settings)
- [Database Management](#database-management)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Account Creation Overview

FloorIA uses a **secure, admin-only** account creation system. This means:

- ✅ **Administrators** create accounts via Supabase dashboard
- ❌ **Public registration** is disabled (no signup button in the app)
- 🔒 **Users** can only log in with existing accounts
- 👥 **Account requests** must go through administrators

### Why This Approach?

1. **Security**: Prevents unauthorized access to architectural analysis tools
2. **Control**: Administrators decide who gets access
3. **Compliance**: Meets enterprise security requirements
4. **Quality**: Ensures only legitimate users access the system

---

## Creating User Accounts

### Step-by-Step Account Creation

**Prerequisites:**
- Access to the Supabase dashboard
- Administrator privileges on the FloorIA project

**Steps:**

1. **Login to Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in with your administrator account
   - Select the FloorIA project

2. **Navigate to Authentication**
   - Click **"Authentication"** in the left sidebar
   - Click **"Users"** to see the user management interface

3. **Create New User**
   - Click the **"Add user"** button (top right)
   - Fill in the user information:

   ```
   Email: user@company.com
   Password: [Generate secure password]
   Auto Confirm User: ✅ (Check this box)
   ```

4. **Set User Metadata**
   - In the **"User Metadata"** section, add:
   ```json
   {
     "full_name": "John Doe",
     "role": "user"
   }
   ```
   - For admin users, use `"role": "admin"`

5. **Create the Account**
   - Click **"Create user"**
   - The user account is immediately active

6. **Provide Credentials to User**
   - Send the email and temporary password securely
   - Instruct user to change password on first login

### User Account Types

**Regular User Account:**
```json
{
  "full_name": "Jane Smith",
  "role": "user"
}
```
- Can log in to FloorIA
- Can analyze architectural images
- Can export analysis results
- Cannot access admin functions

**Administrator Account:**
```json
{
  "full_name": "Admin User",
  "role": "admin"
}
```
- All user permissions
- Can access Supabase dashboard
- Can create/manage other users
- Can modify system settings

---

## Setting Up the First Administrator

### Initial Setup Process

When setting up FloorIA for the first time, you need to create the first administrator account:

**Method 1: Through Supabase Dashboard (Recommended)**

1. **Access Your Supabase Project**
   - Login to [https://app.supabase.com](https://app.supabase.com)
   - Open your FloorIA project

2. **Create Admin User**
   - Go to **Authentication > Users**
   - Click **"Add user"**
   - Set up the admin account:
   ```
   Email: admin@yourcompany.com
   Password: [Strong password]
   Auto Confirm User: ✅
   User Metadata:
   {
     "full_name": "System Administrator",
     "role": "admin"
   }
   ```

3. **Verify Admin Access**
   - Test login through FloorIA application
   - Confirm admin can access all features

**Method 2: SQL Command (Advanced)**

If you prefer using SQL, you can create the admin user directly:

```sql
-- Insert into auth.users (this creates the authentication record)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@yourcompany.com',
  crypt('your_secure_password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "System Administrator", "role": "admin"}'
);

-- Insert into profiles table
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yourcompany.com'),
  'admin@yourcompany.com',
  'System Administrator',
  'admin',
  NOW(),
  NOW()
);
```

### Admin Account Security

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not based on dictionary words
- Unique to this application

**Security Best Practices:**
- Enable 2FA if available
- Use a password manager
- Regular password rotation (every 90 days)
- Monitor login activity
- Limit admin accounts to necessary personnel only

---

## Accessing the Supabase Dashboard

1. **Login to Supabase**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in with your Supabase account credentials
   - Select your FloorIA project

2. **Navigate to Authentication**
   - In the left sidebar, click on **"Authentication"**
   - This section contains all user management tools

---

## User Management

### Viewing All Users

1. Go to **Authentication > Users**
2. Here you can see all registered users with:
   - Email addresses
   - Registration dates
   - Last sign-in times
   - User metadata
   - Email confirmation status

### Creating New Users

**Method 1: Manual Creation (Admin)**
1. In **Authentication > Users**, click **"Add user"**
2. Fill in the required information:
   - **Email**: User's email address
   - **Password**: Temporary password (user should change it)
   - **Auto Confirm User**: Check this to skip email verification
   - **User Metadata**: Add custom fields like `full_name`, `role`

**Method 2: Self-Registration**
- Users can register through the FloorIA application
- They will receive an email confirmation (if enabled)
- Admin can approve/manage them afterward

### Editing User Information

1. Click on any user in the **Authentication > Users** list
2. You can modify:
   - **Email address**
   - **Password** (reset)
   - **User metadata** (role, full_name, etc.)
   - **Email confirmed status**
   - **Account status** (active/inactive)

### Deleting Users

1. Select the user from the **Authentication > Users** list
2. Click the **"Delete user"** button
3. Confirm the deletion
4. **⚠️ Warning**: This action is irreversible

---

## Role Management

FloorIA uses a role-based access system with two main roles:

### User Roles

**1. Regular User (`user`)**
- Can log in to the application
- Can analyze architectural images
- Can export analysis results
- Cannot access admin functions

**2. Administrator (`admin`)**
- All user permissions
- Can manage other users (through Supabase dashboard)
- Can access system settings
- Can view usage analytics

### Setting User Roles

1. Go to **Authentication > Users**
2. Click on the user you want to modify
3. In the **"User Metadata"** section, add or modify:
   ```json
   {
     "role": "admin",
     "full_name": "John Doe"
   }
   ```
4. Click **"Update user"**

### Creating the First Admin User

If you need to create the first admin user:

1. **Create the user** through Supabase dashboard
2. **Set the metadata**:
   ```json
   {
     "role": "admin",
     "full_name": "Administrator Name"
   }
   ```
3. **Confirm the email** manually if needed
4. The user can now access admin functions

---

## Authentication Settings

### Email Configuration

1. Go to **Authentication > Settings**
2. Configure **SMTP settings** for email delivery:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User/Password**: Your email credentials
   - **Sender Email**: The "from" address for auth emails

### Email Templates

Customize the email templates in **Authentication > Templates**:
- **Confirm signup**: Welcome email with confirmation link
- **Invite user**: Admin invitation emails
- **Magic link**: Passwordless login emails
- **Change email address**: Email change confirmation
- **Reset password**: Password reset emails

### Security Settings

In **Authentication > Settings**:

1. **Site URL**: Set to your production domain
2. **Redirect URLs**: Add allowed redirect URLs after auth
3. **JWT Settings**:
   - **JWT expiry**: Token lifetime (default: 1 hour)
   - **Refresh token expiry**: Refresh token lifetime (default: 30 days)
4. **Rate Limiting**: Configure to prevent abuse
5. **Password Requirements**: Set minimum complexity

---

## Database Management

### Profiles Table

FloorIA uses a `profiles` table to store extended user information:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Managing Profiles

1. Go to **Table Editor > profiles**
2. You can:
   - View all user profiles
   - Edit user information directly
   - Add new fields as needed
   - Set up Row Level Security (RLS) policies

### Row Level Security (RLS)

Ensure RLS is enabled on the profiles table:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Security Best Practices

### 1. Environment Variables

- **Never commit** your Supabase keys to version control
- Use **anon/public key** for frontend
- Use **service role key** only for server-side operations
- Store keys in secure environment variables

### 2. API Key Management

- **Rotate keys** regularly
- **Monitor usage** in the Supabase dashboard
- **Set up alerts** for unusual activity
- **Use different projects** for development/production

### 3. User Access Control

- **Review user roles** regularly
- **Remove inactive users** periodically
- **Monitor login attempts** and failed authentications
- **Set up proper redirect URLs** to prevent phishing

### 4. Database Security

- **Enable RLS** on all tables
- **Create specific policies** for each user role
- **Audit database access** regularly
- **Backup your data** regularly

---

## Troubleshooting

### Common Issues

**1. User Can't Log In**
- Check if email is confirmed in **Authentication > Users**
- Verify the user exists and is active
- Check if password is correct (reset if needed)
- Ensure SMTP is configured for email delivery

**2. Authentication Errors in App**
- Verify `SUPABASE_URL` and `SUPABASE_APIKEY` in `.env`
- Check if the API keys are correct and not expired
- Ensure the frontend is using the anon key, not service key

**3. Role Permissions Not Working**
- Check user metadata in **Authentication > Users**
- Verify the `role` field is set correctly
- Ensure RLS policies are properly configured
- Check if the profiles table exists and is populated

**4. Email Not Sending**
- Verify SMTP configuration in **Authentication > Settings**
- Check spam folders
- Test with a different email provider
- Review email templates for errors

### Getting Help

1. **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
2. **Community Support**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Discord Community**: [https://discord.supabase.com](https://discord.supabase.com)

---

## Quick Reference Commands

### SQL Queries for Common Tasks

**Get all admin users:**
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

**Count users by role:**
```sql
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

**Find inactive users:**
```sql
SELECT * FROM profiles WHERE is_active = false;
```

**Users registered in last 7 days:**
```sql
SELECT * FROM profiles 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## Conclusion

Using Supabase for user management provides a robust, secure, and scalable solution for FloorIA. The dashboard interface makes it easy to manage users without custom admin panels, while the powerful authentication system handles security automatically.

For any questions or issues not covered in this guide, refer to the official Supabase documentation or contact the development team.
