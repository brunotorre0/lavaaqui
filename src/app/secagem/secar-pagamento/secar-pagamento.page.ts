import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { DryingService } from '../drying.service';
import { HistoryService } from '../../historico/history.service';

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
    private historyService: HistoryService
  ) {}

  ionViewWillEnter() {
    this.summary = this.dryingService.getSummary();
    if (!this.summary) {
      this.router.navigate(['/secagem/secar']);
    }
  }

  goBack() {
    this.router.navigate(['/secagem/ciclos']);
  }

  selectPayment(id: string) {
    this.selectedPayment = id;
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

    // Guardar no histórico antes de resetar
    if (this.summary) {
      this.historyService.addEntry({
        type: 'secagem',
        label: this.summary.machine.label,
        price: this.summary.total,
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
}

