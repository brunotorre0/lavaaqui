import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { DryerMachine, DryingService } from '../drying.service';
import { AccountMenuComponent } from '../../home/account-menu.component';
import { LaundryPriceService } from '../../shared/laundry-price.service';

@Component({
  selector: 'app-secar',
  templateUrl: './secar.page.html',
  styleUrls: ['./secar.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SecarPage implements OnInit {
  machines: DryerMachine[] = [];
  userEmail: string = '';

  constructor(
    private router: Router,
    private dryingService: DryingService,
    private popoverController: PopoverController,
    private laundryPriceService: LaundryPriceService
  ) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email;
    }
  }

  ngOnInit() {
    const selectedLaundry = localStorage.getItem('selectedLaundry');
    if (!selectedLaundry) {
      this.router.navigate(['/home']);
      return;
    }
    this.updatePrices();
  }

  ionViewWillEnter() {
    const selectedLaundry = localStorage.getItem('selectedLaundry');
    if (!selectedLaundry) {
      this.router.navigate(['/home']);
      return;
    }
    this.updatePrices();
  }

  updatePrices() {
    this.machines = [
      { id: 1, label: 'Secagem 6Kg - 20min', weightKg: 6, durationMinutes: 20, price: this.laundryPriceService.getDryingPrice(6) },
      { id: 2, label: 'Secagem 9Kg - 20min', weightKg: 9, durationMinutes: 20, price: this.laundryPriceService.getDryingPrice(9) },
      { id: 3, label: 'Secagem 9Kg - 20min', weightKg: 9, durationMinutes: 20, price: this.laundryPriceService.getDryingPrice(9) },
      { id: 4, label: 'Secagem 15Kg - 20min', weightKg: 15, durationMinutes: 20, price: this.laundryPriceService.getDryingPrice(15) },
    ];
  }

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

