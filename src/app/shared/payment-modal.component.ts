import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

export interface PaymentData {
  paymentMethod: string;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  reference?: string;
}

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PaymentModalComponent implements OnInit {
  @Input() paymentMethod: string = '';
  @Input() amount: number = 0;

  // Dados do formulário
  cardNumber: string = '';
  cardName: string = '';
  expiryDate: string = '';
  cvv: string = '';
  phoneNumber: string = '';
  email: string = '';
  password: string = '';
  reference: string = '';

  constructor(private modalController: ModalController) {}

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  getPaymentMethodLabel(): string {
    switch (this.paymentMethod) {
      case 'card':
        return 'Cartão de Crédito';
      case 'mb-way':
        return 'MB WAY';
      case 'paypal':
        return 'PayPal';
      case 'multibanco':
        return 'MB MULTIBANCO';
      default:
        return 'Pagamento';
    }
  }

  generateMultibancoReference(): void {
    // Gera uma referência multibanco simulada (formato: 123 456 789)
    const part1 = Math.floor(Math.random() * 900) + 100;
    const part2 = Math.floor(Math.random() * 900) + 100;
    const part3 = Math.floor(Math.random() * 900) + 100;
    this.reference = `${part1} ${part2} ${part3}`;
  }

  ngOnInit() {
    if (this.paymentMethod === 'multibanco') {
      this.generateMultibancoReference();
    }
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substring(0, 19);
    }
    this.cardNumber = formattedValue;
    event.target.value = formattedValue;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.expiryDate = value;
    event.target.value = value;
  }

  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.substring(0, 3);
    }
    this.cvv = value;
    event.target.value = value;
  }

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    this.phoneNumber = value;
    event.target.value = value;
  }

  isFormValid(): boolean {
    switch (this.paymentMethod) {
      case 'card':
        return !!(
          this.cardNumber.replace(/\s/g, '').length >= 16 &&
          this.cardName.length >= 3 &&
          this.expiryDate.length === 5 &&
          this.cvv.length === 3
        );
      case 'mb-way':
        return this.phoneNumber.length === 9;
      case 'paypal':
        return !!(this.email.includes('@') && this.password.length >= 6);
      case 'multibanco':
        return true; // Apenas exibe a referência
      default:
        return false;
    }
  }

  async confirmPayment() {
    if (!this.isFormValid()) {
      return;
    }

    const paymentData: PaymentData = {
      paymentMethod: this.paymentMethod,
    };

    switch (this.paymentMethod) {
      case 'card':
        paymentData.cardNumber = this.cardNumber.replace(/\s/g, '');
        paymentData.cardName = this.cardName;
        paymentData.expiryDate = this.expiryDate;
        paymentData.cvv = this.cvv;
        break;
      case 'mb-way':
        paymentData.phoneNumber = this.phoneNumber;
        break;
      case 'paypal':
        paymentData.email = this.email;
        paymentData.password = this.password;
        break;
      case 'multibanco':
        paymentData.reference = this.reference;
        break;
    }

    await this.modalController.dismiss(paymentData, 'confirmed');
  }

  cancel() {
    this.modalController.dismiss(null, 'canceled');
  }
}

