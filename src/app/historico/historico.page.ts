import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { HistoryService, HistoryEntry } from './history.service';
import { AccountMenuComponent } from '../home/account-menu.component';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistoricoPage implements OnInit {
  history: HistoryEntry[] = [];
  userEmail: string = '';

  constructor(
    private router: Router,
    private historyService: HistoryService,
    private popoverController: PopoverController
  ) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email;
    }
  }

  ngOnInit() {
    this.loadHistory();
  }

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.history = this.historyService.getHistory();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  getTypeClass(type: string): string {
    return type === 'secagem' ? 'type-secagem' : 'type-lavagem';
  }

  getProgramLabel(program: string): string {
    const programs: { [key: string]: string } = {
      'normal': 'Normal',
      'delicado': 'Delicado',
      'intensivo': 'Intensivo',
      'rapido': 'Rápido',
      'eco': 'Ecológico'
    };
    return programs[program] || program;
  }

  getPaymentIcon(paymentMethod: string | undefined): string {
    if (!paymentMethod) return 'card-outline';
    
    const method = paymentMethod.toLowerCase();
    if (method.includes('cartão') || method.includes('card')) {
      return 'card-outline';
    } else if (method.includes('mb way') || method.includes('mbway')) {
      return 'logo-euro';
    } else if (method.includes('paypal')) {
      return 'logo-paypal';
    } else if (method.includes('multibanco') || method.includes('mb multibanco')) {
      return 'cash-outline';
    }
    return 'card-outline';
  }

  getPaymentClass(paymentMethod: string | undefined): string {
    if (!paymentMethod) return '';
    
    const method = paymentMethod.toLowerCase();
    if (method.includes('cartão') || method.includes('card')) {
      return 'payment-card';
    } else if (method.includes('mb way') || method.includes('mbway')) {
      return 'payment-mbway';
    } else if (method.includes('paypal')) {
      return 'payment-paypal';
    } else if (method.includes('multibanco') || method.includes('mb multibanco')) {
      return 'payment-multibanco';
    }
    return '';
  }

  async openAccountMenu(event: Event) {
    const popover = await this.popoverController.create({
      component: AccountMenuComponent,
      event: event,
      translucent: true,
      componentProps: {
        userEmail: this.userEmail
      }
    });
    
    await popover.present();
    
    const { data } = await popover.onDidDismiss();
    if (data && data.logout) {
      this.logout();
    } else if (data && data.updateProfile) {
      this.router.navigate(['/perfil']);
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedLaundry');
    this.router.navigate(['/login']);
  }
}

