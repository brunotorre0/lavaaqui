import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { DryerMachine, DryingService } from '../drying.service';
import { AccountMenuComponent } from '../../home/account-menu.component';

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
  userEmail: string = '';

  constructor(
    private router: Router,
    private dryingService: DryingService,
    private popoverController: PopoverController
  ) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email;
    }
  }

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

