/**
 * Modal d'authentification pour FloorIA
 */
import { authManager, LoginCredentials } from './supabaseClient';

export class AuthModal {
    private modal: HTMLElement | null = null;
    private onAuthSuccess?: (user: any) => void;

    constructor(onAuthSuccess?: (user: any) => void) {
        this.onAuthSuccess = onAuthSuccess;
        this.createModal();
        this.bindEvents();
    }

    private createModal(): void {
        const modalHTML = `
            <div id="auth-modal" class="auth-modal" style="display: none;">
                <div class="auth-modal-overlay">
                    <div class="auth-modal-content">
                        <div class="auth-modal-header">
                            <h2 id="auth-modal-title">Connexion à FloorIA</h2>
                            <button id="auth-modal-close" class="auth-modal-close">&times;</button>
                        </div>
                        
                        <div class="auth-modal-body">
                            <div class="auth-info">
                                <p>🔒 Accès restreint - Connexion requise</p>
                                <p>Pour obtenir un compte, contactez votre administrateur.</p>
                            </div>
                            
                            <form id="auth-form">
                                <div class="auth-form-group">
                                    <label for="auth-email">Email</label>
                                    <input type="email" id="auth-email" required>
                                </div>
                                
                                <div class="auth-form-group">
                                    <label for="auth-password">Mot de passe</label>
                                    <input type="password" id="auth-password" required>
                                </div>
                                
                                <div class="auth-form-actions">
                                    <button type="submit" id="auth-submit-btn" class="auth-btn auth-btn-primary">
                                        Se connecter
                                    </button>
                                </div>
                            </form>
                            
                            <div id="auth-message" class="auth-message" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('auth-modal');
    }

    private bindEvents(): void {
        if (!this.modal) return;

        // Fermer la modal
        const closeBtn = this.modal.querySelector('#auth-modal-close') as HTMLElement;
        const overlay = this.modal.querySelector('.auth-modal-overlay') as HTMLElement;
        
        closeBtn?.addEventListener('click', () => this.hide());
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });

        // Gestion du formulaire
        const form = this.modal.querySelector('#auth-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    private async handleSubmit(): Promise<void> {
        if (!this.modal) return;

        const emailInput = this.modal.querySelector('#auth-email') as HTMLInputElement;
        const passwordInput = this.modal.querySelector('#auth-password') as HTMLInputElement;
        const submitBtn = this.modal.querySelector('#auth-submit-btn') as HTMLButtonElement;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            this.showMessage('Veuillez remplir tous les champs requis.', 'error');
            return;
        }

        // Désactiver le bouton pendant la requête
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            const credentials: LoginCredentials = { email, password };
            const result = await authManager.signIn(credentials);

            if (result.success) {
                this.showMessage(result.message, 'success');
                
                if (result.user) {
                    // Connexion réussie, fermer la modal après un délai
                    setTimeout(() => {
                        this.hide();
                        this.onAuthSuccess?.(result.user);
                    }, 1500);
                }
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showMessage('Une erreur est survenue. Veuillez réessayer.', 'error');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    }

    private showMessage(message: string, type: 'success' | 'error'): void {
        if (!this.modal) return;

        const messageDiv = this.modal.querySelector('#auth-message') as HTMLElement;
        messageDiv.textContent = message;
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.style.display = 'block';

        // Masquer le message après 5 secondes
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    private clearForm(): void {
        if (!this.modal) return;

        const form = this.modal.querySelector('#auth-form') as HTMLFormElement;
        form.reset();
        
        const messageDiv = this.modal.querySelector('#auth-message') as HTMLElement;
        messageDiv.style.display = 'none';
    }

    public show(): void {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Focus sur le champ email
            const emailInput = this.modal.querySelector('#auth-email') as HTMLInputElement;
            setTimeout(() => emailInput?.focus(), 100);
        }
    }

    public hide(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.clearForm();
        }
    }

    public isVisible(): boolean {
        return this.modal ? this.modal.style.display === 'block' : false;
    }

    public destroy(): void {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}
