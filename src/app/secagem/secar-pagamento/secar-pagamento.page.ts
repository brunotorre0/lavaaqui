import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, ToastController, PopoverController, ModalController } from '@ionic/angular';
import { DryingService } from '../drying.service';
import { HistoryService } from '../../historico/history.service';
import { AccountMenuComponent } from '../../home/account-menu.component';
import { PaymentModalComponent, PaymentData } from '../../shared/payment-modal.component';

interface PaymentOption {
  id: string;
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-secar-pagamento',
  templateUrl: './secar-pagamento.page.html',
  styleUrls: ['./secar-pagamento.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SecarPagamentoPage {
  summary = this.dryingService.getSummary();
  selectedPayment: string | null = null;
  userEmail: string = '';

  paymentOptions: PaymentOption[] = [
    { id: 'card', label: 'Cartão de Crédito', icon: 'card-outline', colorClass: 'card' },
    { id: 'mb-way', label: 'MB WAY', icon: 'logo-euro', colorClass: 'mbway' },
    { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', colorClass: 'paypal' },
    { id: 'multibanco', label: 'MB MULTIBANCO', icon: 'cash-outline', colorClass: 'multibanco' },
  ];

  constructor(
    private router: Router,
    private dryingService: DryingService,
    private toastController: ToastController,
    private historyService: HistoryService,
    private popoverController: PopoverController,
    private modalController: ModalController
  ) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email;
    }
  }

  ionViewWillEnter() {
    this.summary = this.dryingService.getSummary();
    if (!this.summary) {
      this.router.navigate(['/secagem/secar']);
    }
  }

  goBack() {
    this.router.navigate(['/secagem/ciclos']);
  }

  async selectPayment(id: string) {
    if (!this.summary) return;
    
    const modal = await this.modalController.create({
      component: PaymentModalComponent,
      componentProps: {
        paymentMethod: id,
        amount: this.summary.total
      },
      cssClass: 'payment-modal'
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    
    if (role === 'confirmed' && data) {
      this.selectedPayment = id;
      const toast = await this.toastController.create({
        message: 'Dados de pagamento confirmados!',
        duration: 1500,
        color: 'success',
      });
      toast.present();
    }
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  async pay() {
    if (!this.selectedPayment) {
      const toast = await this.toastController.create({
        message: 'Selecione um método de pagamento.',
        duration: 1500,
        color: 'warning',
      });
      toast.present();
      return;
    }

    if (this.summary) {
      const paymentMethodLabel = this.paymentOptions.find(p => p.id === this.selectedPayment)?.label || 'Desconhecido';
      this.historyService.addEntry({
        type: 'secagem',
        label: this.summary.machine.label,
        price: this.summary.total,
        machineWeight: this.summary.machine.weightKg,
        duration: this.summary.machine.durationMinutes,
        cycles: this.summary.cycles,
        paymentMethod: paymentMethodLabel,
      });
    }

    const toast = await this.toastController.create({
      message: 'Pagamento concluído! Obrigado.',
      duration: 1600,
      color: 'success',
    });
    toast.present();
    this.dryingService.reset();
    this.router.navigate(['/home']);
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
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedLaundry');
    this.router.navigate(['/login']);
  }
}

