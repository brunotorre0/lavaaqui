import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  activeTab = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
  ) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'login') {
      this.confirmPassword = '';
      this.showConfirmPassword = false;
    }
  }

  togglePasswordVisibility(field: 'login' | 'confirm') {
    if (field === 'login') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      await this.presentAlert('Campos obrigatórios', 'Introduza o e-mail e a palavra-passe para continuar.');
      return;
    }

    const registeredAccounts = this.getRegisteredAccounts();
    const account = registeredAccounts.find(acc => acc.email === this.email.trim());
    
    if (!account) {
      await this.presentAlert('Conta não encontrada', 'Esta conta não está registada. Por favor, registe-se primeiro.');
      return;
    }

    if (account.password !== this.password) {
      await this.presentAlert('Palavra-passe incorreta', 'A palavra-passe introduzida está incorreta.');
      return;
    }

    localStorage.setItem('userEmail', this.email.trim());
    
    this.router.navigate(['/home']);
  }

  async onSignUp() {
    if (!this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      await this.presentAlert('Campos obrigatórios', 'Preencha todos os campos para criar a conta.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.presentAlert('Palavras-passe diferentes', 'Confirme que as duas palavras-passe são iguais.');
      return;
    }

    const registeredAccounts = this.getRegisteredAccounts();
    const existingAccount = registeredAccounts.find(acc => acc.email === this.email.trim());
    
    if (existingAccount) {
      await this.presentAlert('Conta já existe', 'Já existe uma conta com este e-mail. Por favor, use outro e-mail ou inicie sessão.');
      return;
    }

    const newAccount = {
      email: this.email.trim(),
      password: this.password
    };
    registeredAccounts.push(newAccount);
    localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));
    
    await this.presentAlert('Conta registada', 'A sua conta foi criada com sucesso! Agora pode iniciar sessão.');
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.setActiveTab('login');
  }

  private getRegisteredAccounts(): Array<{email: string, password: string}> {
    const stored = localStorage.getItem('registeredAccounts');
    return stored ? JSON.parse(stored) : [];
  }

  async onGoogleLogin() {
    const clientId = environment.googleClientId;
    
    if (clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      await this.presentAlert('Configuração necessária', 'Configure o Google Client ID no ficheiro src/environments/environment.ts');
      return;
    }

    try {
      await this.loadGoogleScript();
      await this.signInWithGoogle(clientId);
    } catch (error: any) {
      await this.presentAlert('Erro', error?.message || 'Não foi possível fazer login com o Google.');
    }
  }

  async onFacebookLogin() {
    const appId = environment.facebookAppId;
    
    if (appId === 'YOUR_FACEBOOK_APP_ID') {
      await this.presentAlert('Configuração necessária', 'Configure o Facebook App ID no ficheiro src/environments/environment.ts');
      return;
    }

    try {
      await this.loadFacebookScript(appId);
      await this.signInWithFacebook();
    } catch (error: any) {
      await this.presentAlert('Erro', error?.message || 'Não foi possível fazer login com o Facebook.');
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Google Sign-In'));
      document.head.appendChild(script);
    });
  }

  private signInWithGoogle(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts) {
        reject(new Error('Google Sign-In não está disponível'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          try {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error));
              return;
            }

            const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
            }).then(res => {
              if (!res.ok) {
                throw new Error('Falha ao obter informações do utilizador');
              }
              return res.json();
            });
            
            if (userInfo.email) {
              localStorage.setItem('userEmail', userInfo.email);
              localStorage.setItem('authProvider', 'google');
              this.router.navigate(['/home']);
              resolve();
            } else {
              reject(new Error('Email não disponível'));
            }
          } catch (error: any) {
            reject(error);
          }
        }
      });

      tokenClient.requestAccessToken();
    });
  }

  private loadFacebookScript(appId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/pt_PT/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Falha ao carregar Facebook SDK'));
      document.head.appendChild(script);
    });
  }

  private signInWithFacebook(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK não está disponível'));
        return;
      }

      window.FB.login((response: any) => {
        if (response.authResponse) {
          window.FB!.api('/me', { fields: 'email,name' }, (userInfo: any) => {
            if (userInfo.error) {
              reject(new Error(userInfo.error.message || 'Erro ao obter informações do utilizador'));
              return;
            }
            
            if (userInfo.email) {
              localStorage.setItem('userEmail', userInfo.email);
              localStorage.setItem('authProvider', 'facebook');
              if (userInfo.name) {
                localStorage.setItem('userName', userInfo.name);
              }
              this.router.navigate(['/home']);
              resolve();
            } else {
              reject(new Error('Email não disponível. Por favor, conceda permissão para aceder ao email.'));
            }
          });
        } else if (response.status === 'not_authorized') {
          reject(new Error('Login não autorizado. Por favor, conceda as permissões necessárias.'));
        } else {
          reject(new Error('Login cancelado pelo utilizador.'));
        }
      }, { scope: 'email', auth_type: 'rerequest' });
    });
  }

  private async presentAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
