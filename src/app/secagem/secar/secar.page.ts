import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DryerMachine, DryingService } from '../drying.service';

@Component({
  selector: 'app-secar',
  templateUrl: './secar.page.html',
  styleUrls: ['./secar.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SecarPage {
  machines: DryerMachine[] = [
    { id: 1, label: 'Secagem 6Kg - 20min', weightKg: 6, durationMinutes: 20, price: 3.5 },
    { id: 2, label: 'Secagem 9Kg - 20min', weightKg: 9, durationMinutes: 20, price: 4.5 },
    { id: 3, label: 'Secagem 9Kg - 20min', weightKg: 9, durationMinutes: 20, price: 4.5 },
    { id: 4, label: 'Secagem 15Kg - 20min', weightKg: 15, durationMinutes: 20, price: 6.5 },
  ];

  constructor(
    private router: Router,
    private dryingService: DryingService
  ) {}

  goBack() {
    this.router.navigate(['/home']);
  }

  selectMachine(machine: DryerMachine) {
    this.dryingService.selectMachine(machine);
    this.router.navigate(['/secagem/ciclos']);
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }
}

