import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DryerMachine, DryingService } from '../drying.service';

@Component({
  selector: 'app-secar-ciclos',
  templateUrl: './secar-ciclos.page.html',
  styleUrls: ['./secar-ciclos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SecarCiclosPage {
  machine: DryerMachine | null = null;
  cyclesOptions = [20, 40, 60];
  cycles = 20;

  constructor(
    private router: Router,
    private dryingService: DryingService
  ) {}

  ionViewWillEnter() {
    const selection = this.dryingService.getSelectedMachine();
    if (!selection) {
      this.router.navigate(['/secagem/secar']);
      return;
    }
    this.machine = selection;
    this.cycles = this.dryingService.getCycles();
  }

  goBack() {
    this.router.navigate(['/secagem/secar']);
  }

  selectCycles(value: number) {
    this.cycles = value;
    this.dryingService.setCycles(value);
  }

  goToPayment() {
    this.router.navigate(['/secagem/pagamento']);
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  get total() {
    return this.dryingService.getTotalPrice();
  }
}

