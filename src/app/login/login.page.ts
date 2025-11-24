import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  activeTab = 'login';
  name = '';
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
    if (!this.name.trim() || !this.password.trim()) {
      await this.presentAlert('Campos obrigatórios', 'Introduza o nome e a palavra-passe para continuar.');
      return;
    }

    const registeredAccounts = this.getRegisteredAccounts();
    const account = registeredAccounts.find(acc => acc.name === this.name.trim());
    
    if (!account) {
      await this.presentAlert('Conta não encontrada', 'Esta conta não está registada. Por favor, registe-se primeiro.');
      return;
    }

    if (account.password !== this.password) {
      await this.presentAlert('Palavra-passe incorreta', 'A palavra-passe introduzida está incorreta.');
      return;
    }

    localStorage.setItem('userEmail', this.name.trim());
    localStorage.setItem('userName', this.name.trim());
    
    this.router.navigate(['/home']);
  }

  async onSignUp() {
    if (!this.name.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      await this.presentAlert('Campos obrigatórios', 'Preencha todos os campos para criar a conta.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.presentAlert('Palavras-passe diferentes', 'Confirme que as duas palavras-passe são iguais.');
      return;
    }

    const registeredAccounts = this.getRegisteredAccounts();
    const existingAccount = registeredAccounts.find(acc => acc.name === this.name.trim());
    
    if (existingAccount) {
      await this.presentAlert('Conta já existe', 'Já existe uma conta com este nome. Por favor, use outro nome ou inicie sessão.');
      return;
    }

    const newAccount = {
      name: this.name.trim(),
      password: this.password
    };
    registeredAccounts.push(newAccount);
    localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));
    
    localStorage.setItem('userEmail', this.name.trim());
    localStorage.setItem('userName', this.name.trim());
    
    await this.presentAlert('Conta registada', 'A sua conta foi criada com sucesso! Agora pode iniciar sessão.');
    this.name = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.setActiveTab('login');
  }

  private getRegisteredAccounts(): Array<{name: string, password: string}> {
    const stored = localStorage.getItem('registeredAccounts');
    if (!stored) return [];
    const accounts = JSON.parse(stored);
    return accounts.map((acc: any) => {
      if (acc.email && !acc.name) {
        return { name: acc.email, password: acc.password };
      }
      return { name: acc.name || acc.email || '', password: acc.password };
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
