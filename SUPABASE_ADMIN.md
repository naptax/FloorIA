# Supabase Administration Guide for FloorIA

This guide explains how to manage users, roles, and authentication settings using the Supabase dashboard for the FloorIA application.

## Table of Contents

- [Accessing the Supabase Dashboard](#accessing-the-supabase-dashboard)
- [User Management](#user-management)
- [Role Management](#role-management)
- [Authentication Settings](#authentication-settings)
- [Database Management](#database-management)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

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
