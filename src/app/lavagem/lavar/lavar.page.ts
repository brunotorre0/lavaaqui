import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { WashingMachine, LavagemService } from '../lavagem.service';
import { AccountMenuComponent } from '../../home/account-menu.component';
import { LaundryPriceService } from '../../shared/laundry-price.service';

@Component({
  selector: 'app-lavar',
  templateUrl: './lavar.page.html',
  styleUrls: ['./lavar.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LavarPage implements OnInit {
  machines: WashingMachine[] = [];
  userEmail: string = '';

  constructor(
    private router: Router,
    private lavagemService: LavagemService,
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
      { id: 1, label: 'Lavagem 6Kg - 30min', weightKg: 6, durationMinutes: 30, price: this.laundryPriceService.getWashingPrice(6) },
      { id: 2, label: 'Lavagem 9Kg - 30min', weightKg: 9, durationMinutes: 30, price: this.laundryPriceService.getWashingPrice(9) },
      { id: 3, label: 'Lavagem 9Kg - 30min', weightKg: 9, durationMinutes: 30, price: this.laundryPriceService.getWashingPrice(9) },
      { id: 4, label: 'Lavagem 15Kg - 30min', weightKg: 15, durationMinutes: 30, price: this.laundryPriceService.getWashingPrice(15) },
    ];
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  selectMachine(machine: WashingMachine) {
    this.lavagemService.selectMachine(machine);
    this.router.navigate(['/lavagem/ciclos']);
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
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedLaundry');
    this.router.navigate(['/login']);
  }
}

