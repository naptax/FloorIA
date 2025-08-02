"""
Authentication middleware for FastAPI using Supabase.
"""
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from supabase_client import supabase_auth

# Security scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user.
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        User information dictionary
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = supabase_auth.verify_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict[str, Any]]:
    """
    Optional dependency to get the current authenticated user.
    Returns None if no token is provided or token is invalid.
    
    Args:
        credentials: Optional HTTP Bearer token from request header
        
    Returns:
        User information dictionary or None
    """
    if not credentials:
        return None
    
    return supabase_auth.verify_token(credentials.credentials)

def require_auth(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency that requires authentication.
    
    Args:
        user: Current user from get_current_user dependency
        
    Returns:
        User information dictionary
    """
    return user
