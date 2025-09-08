/**
 * Supabase client configuration for FloorIA frontend
 */
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// Configuration Supabase - Using environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Types pour l'authentification
export interface AuthUser {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
}

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    full_name?: string;
}

// Classe pour gérer l'authentification
export class AuthManager {
    private static instance: AuthManager;
    private currentUser: AuthUser | null = null;
    private currentSession: AuthSession | null = null;
    private authListeners: ((user: AuthUser | null) => void)[] = [];

    private constructor() {
        this.initializeAuth();
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    private async initializeAuth(): Promise<void> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.setSession(session);
            }

            // Écouter les changements d'authentification
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session);
                if (session) {
                    this.setSession(session);
                } else {
                    this.clearSession();
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    }

    private setSession(session: Session): void {
        this.currentSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0
        };

        this.currentUser = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name
        };

        // Stocker le token dans localStorage pour les requêtes API
        localStorage.setItem('supabase_token', session.access_token);
        
        this.notifyAuthListeners(this.currentUser);
    }

    private clearSession(): void {
        this.currentUser = null;
        this.currentSession = null;
        localStorage.removeItem('supabase_token');
        this.notifyAuthListeners(null);
    }

    private notifyAuthListeners(user: AuthUser | null): void {
        this.authListeners.forEach(listener => listener(user));
    }

    public onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
        this.authListeners.push(callback);
        
        // Retourner une fonction pour désabonner
        return () => {
            const index = this.authListeners.indexOf(callback);
            if (index > -1) {
                this.authListeners.splice(index, 1);
            }
        };
    }

    public async signUp(credentials: SignupCredentials): Promise<{ success: boolean; message: string; user?: AuthUser }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        full_name: credentials.full_name
                    }
                }
            });

            if (error) {
                return { success: false, message: error.message };
            }

            if (data.user) {
                return {
                    success: true,
                    message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
                    user: {
                        id: data.user.id,
                        email: data.user.email || '',
                        full_name: credentials.full_name
                    }
                };
            }

            return { success: false, message: 'Erreur lors de l\'inscription' };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Erreur lors de l\'inscription' };
        }
    }

    public async signIn(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: AuthUser }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            if (error) {
                return { success: false, message: error.message };
            }

            if (data.user && data.session) {
                return {
                    success: true,
                    message: 'Connexion réussie !',
                    user: this.currentUser!
                };
            }

            return { success: false, message: 'Erreur lors de la connexion' };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, message: 'Erreur lors de la connexion' };
        }
    }

    public async signOut(): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Déconnexion réussie !' };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, message: 'Erreur lors de la déconnexion' };
        }
    }

    public getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    public getCurrentSession(): AuthSession | null {
        return this.currentSession;
    }

    public isAuthenticated(): boolean {
        return this.currentUser !== null && this.currentSession !== null;
    }

    public getAuthToken(): string | null {
        return this.currentSession?.access_token || localStorage.getItem('supabase_token');
    }

    public async refreshSession(): Promise<void> {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error) {
                console.error('Session refresh error:', error);
                throw error;
            }

            if (data.session) {
                this.setSession(data.session);
                console.log('✅ Session refreshed successfully');
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
            this.clearSession();
            throw error;
        }
    }
}

// Instance globale
export const authManager = AuthManager.getInstance();
