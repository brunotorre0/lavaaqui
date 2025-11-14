import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-account-menu',
  standalone: false,
  template: `
    <ion-content class="account-popover-content">
      <div class="account-info">
        <ion-icon name="person-circle-outline" class="account-icon"></ion-icon>
        <div class="account-details">
          <p class="account-email">{{ userEmail || 'Utilizador' }}</p>
          <p class="account-label">Conta</p>
        </div>
      </div>
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

    .account-icon {
      font-size: 3rem;
      color: #6B46C1;
    }

    .account-details {
      flex: 1;
    }

    .account-email {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .account-label {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
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
export class AccountMenuComponent {
  @Input() userEmail: string = '';

  constructor(private popoverController: PopoverController) {}

  logout() {
    this.popoverController.dismiss({ logout: true });
  }
}

