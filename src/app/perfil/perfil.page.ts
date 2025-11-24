import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PerfilPage implements OnInit {
  userEmail: string = '';
  userName: string = '';
  userImage: string = '';
  newName: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.router.navigate(['/login']);
      return;
    }
    this.userEmail = email;
    
    const profileData = this.getProfileData();
    this.userName = profileData.name || email || '';
    this.newName = profileData.name || email || '';
    this.userImage = profileData.image || '';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async updateName() {
    if (!this.newName.trim()) {
      const toast = await this.toastController.create({
        message: 'O nome não pode estar vazio.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const profileData = this.getProfileData();
    profileData.name = this.newName.trim();
    this.saveProfileData(profileData);
    this.userName = this.newName.trim();

    const toast = await this.toastController.create({
      message: 'Nome atualizado com sucesso!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastController.create({
          message: 'Por favor, selecione uma imagem.',
          duration: 2000,
          color: 'warning',
        }).then(toast => toast.present());
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastController.create({
          message: 'A imagem deve ter no máximo 5MB.',
          duration: 2000,
          color: 'warning',
        }).then(toast => toast.present());
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImage = e.target.result;
        const profileData = this.getProfileData();
        profileData.image = e.target.result;
        this.saveProfileData(profileData);

        this.toastController.create({
          message: 'Imagem atualizada com sucesso!',
          duration: 2000,
          color: 'success',
        }).then(toast => toast.present());
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.userImage = '';
    const profileData = this.getProfileData();
    profileData.image = '';
    this.saveProfileData(profileData);

    this.toastController.create({
      message: 'Imagem removida.',
      duration: 2000,
      color: 'success',
    }).then(toast => toast.present());
  }

  private getProfileData(): { name: string; image: string } {
    const stored = localStorage.getItem(`userProfile_${this.userEmail}`);
    return stored ? JSON.parse(stored) : { name: '', image: '' };
  }

  private saveProfileData(profileData: { name: string; image: string }) {
    localStorage.setItem(`userProfile_${this.userEmail}`, JSON.stringify(profileData));
  }

  async updatePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Preencha todos os campos de palavra-passe.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'As palavras-passe não coincidem.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const registeredAccounts = this.getRegisteredAccounts();
    const account = registeredAccounts.find((acc: any) => acc.name === this.userEmail || acc.email === this.userEmail);
    
    if (!account || account.password !== this.currentPassword) {
      const toast = await this.toastController.create({
        message: 'Palavra-passe atual incorreta.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    account.password = this.newPassword;
    localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    const toast = await this.toastController.create({
      message: 'Palavra-passe atualizada com sucesso!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  private getRegisteredAccounts(): Array<any> {
    const stored = localStorage.getItem('registeredAccounts');
    return stored ? JSON.parse(stored) : [];
  }
}

