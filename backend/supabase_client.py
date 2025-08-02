"""
Supabase client configuration and authentication utilities for FloorIA.
"""
import os
import jwt
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SupabaseAuth:
    """Supabase authentication and client management."""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_TOKEN")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_TOKEN must be set in environment variables")
        
        self.client: Client = create_client(self.url, self.key)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify a JWT token from Supabase and return user information.
        
        Args:
            token: JWT token from the frontend
            
        Returns:
            User information if token is valid, None otherwise
        """
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify the token with Supabase
            response = self.client.auth.get_user(token)
            
            if response.user:
                return {
                    'id': response.user.id,
                    'email': response.user.email,
                    'user_metadata': response.user.user_metadata,
                    'app_metadata': response.user.app_metadata
                }
            return None
            
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user information by user ID.
        
        Args:
            user_id: Supabase user ID
            
        Returns:
            User information if found, None otherwise
        """
        try:
            response = self.client.auth.admin.get_user_by_id(user_id)
            if response.user:
                return {
                    'id': response.user.id,
                    'email': response.user.email,
                    'user_metadata': response.user.user_metadata,
                    'app_metadata': response.user.app_metadata,
                    'created_at': response.user.created_at
                }
            return None
        except Exception as e:
            print(f"Error getting user by ID: {e}")
            return None
    
    def create_user_profile(self, user_id: str, email: str, profile_data: Dict[str, Any] = None) -> bool:
        """
        Create or update user profile in the profiles table.
        
        Args:
            user_id: Supabase user ID
            email: User email
            profile_data: Additional profile data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            profile = {
                'id': user_id,
                'email': email,
                'created_at': 'now()',
                'updated_at': 'now()'
            }
            
            if profile_data:
                profile.update(profile_data)
            
            # Insert or update profile
            response = self.client.table('profiles').upsert(profile).execute()
            return len(response.data) > 0
            
        except Exception as e:
            print(f"Error creating user profile: {e}")
            return False
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """
        Get all user profiles (admin only)
        """
        try:
            response = self.client.table('profiles').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching users: {e}")
            return []
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update user profile (admin only)
        """
        try:
            updates['updated_at'] = 'now()'
            response = self.client.table('profiles').update(updates).eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False
    
    def delete_user_profile(self, user_id: str) -> bool:
        """
        Delete user profile (admin only)
        """
        try:
            response = self.client.table('profiles').delete().eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting user profile: {e}")
            return False
    
    def create_admin_user(self, email: str, password: str, full_name: str) -> Dict[str, Any]:
        """
        Create an admin user (system function)
        """
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "role": "admin"
                    }
                }
            })
            
            if response.user:
                # Create profile with admin role
                profile_created = self.create_user_profile(
                    response.user.id,
                    response.user.email,
                    {"full_name": full_name, "role": "admin"}
                )
                
                return {
                    "success": True,
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "profile_created": profile_created
                }
            return {"success": False, "error": "Failed to create user"}
        except Exception as e:
            print(f"Error creating admin user: {e}")
            return {"success": False, "error": str(e)}
    
    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile from the profiles table.
        
        Args:
            user_id: Supabase user ID
            
        Returns:
            User profile if found, None otherwise
        """
        try:
            response = self.client.table('profiles').select('*').eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None

# Global instance
supabase_auth = SupabaseAuth()
