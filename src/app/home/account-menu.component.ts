import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-account-menu',
  standalone: false,
  template: `
    <ion-content class="account-popover-content">
      <div class="account-info">
        <div class="account-avatar">
          <img *ngIf="userImage" [src]="userImage" alt="Foto de perfil" class="avatar-image">
          <ion-icon *ngIf="!userImage" name="person-circle-outline" class="account-icon"></ion-icon>
        </div>
        <div class="account-details">
          <p class="account-name">{{ userName || 'Utilizador' }}</p>
        </div>
      </div>
      <ion-item button (click)="updateProfile()" lines="none" class="menu-item">
        <ion-icon name="create-outline" slot="start"></ion-icon>
        <ion-label>Atualizar Perfil</ion-label>
      </ion-item>
      <ion-item button (click)="logout()" lines="none" class="logout-item">
        <ion-icon name="log-out-outline" slot="start"></ion-icon>
        <ion-label>Sair da conta</ion-label>
      </ion-item>
    </ion-content>
  `,
  styles: [`
    .account-popover-content {
      --padding: 0;
      --background: white;
    }

    .account-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      background: white;
    }

    .account-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .account-icon {
      font-size: 3rem;
      color: #6B46C1;
    }

    .account-details {
      flex: 1;
    }

    .account-name {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .account-email {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
    }

    .menu-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 56px;
      cursor: pointer;
    }

    .menu-item ion-icon {
      color: #6B46C1;
      font-size: 1.3rem;
    }

    .menu-item ion-label {
      color: #1a1a1a;
      font-weight: 500;
    }

    .logout-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 56px;
      cursor: pointer;
    }

    .logout-item ion-icon {
      color: #d32f2f;
      font-size: 1.3rem;
    }

    .logout-item ion-label {
      color: #d32f2f;
      font-weight: 500;
    }
  `]
})
export class AccountMenuComponent implements OnInit {
  @Input() userEmail: string = '';
  userName: string = '';
  userImage: string = '';

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    this.loadProfileData();
  }

  private loadProfileData() {
    if (this.userEmail) {
      const stored = localStorage.getItem(`userProfile_${this.userEmail}`);
      if (stored) {
        const profileData = JSON.parse(stored);
        this.userName = profileData.name || this.userEmail || '';
        this.userImage = profileData.image || '';
      } else {
        this.userName = this.userEmail;
      }
    }
  }

  updateProfile() {
    this.popoverController.dismiss({ updateProfile: true });
  }

  logout() {
    this.popoverController.dismiss({ logout: true });
  }
}

