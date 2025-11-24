import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { WashingMachine, LavagemService } from '../lavagem.service';
import { AccountMenuComponent } from '../../home/account-menu.component';

interface WashingProgram {
  id: string;
  name: string;
  multiplier: number;
}

@Component({
  selector: 'app-lavar-ciclos',
  templateUrl: './lavar-ciclos.page.html',
  styleUrls: ['./lavar-ciclos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LavarCiclosPage {
  machine: WashingMachine | null = null;
  programs: WashingProgram[] = [
    { id: 'rapido', name: 'Rápido', multiplier: 0.8 },
    { id: 'normal', name: 'Normal', multiplier: 1.0 },
    { id: 'intensivo', name: 'Intensivo', multiplier: 1.3 },
    { id: 'frio', name: 'Frio', multiplier: 0.9 },
    { id: 'delicado', name: 'Delicado', multiplier: 1.1 }
  ];
  selectedProgram: WashingProgram = this.programs[1]; // Normal por padrão
  userEmail: string = '';

  constructor(
    private router: Router,
    private lavagemService: LavagemService,
    private popoverController: PopoverController
  ) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email;
    }
  }

  ionViewWillEnter() {
    const selection = this.lavagemService.getSelectedMachine();
    if (!selection) {
      this.router.navigate(['/lavagem/lavar']);
      return;
    }
    this.machine = selection;
    const savedProgramId = this.lavagemService.getProgramId();
    if (savedProgramId) {
      const program = this.programs.find(p => p.id === savedProgramId);
      if (program) {
        this.selectedProgram = program;
      }
    }
  }

  goBack() {
    this.router.navigate(['/lavagem/lavar']);
  }

  selectProgram(program: WashingProgram) {
    this.selectedProgram = program;
    this.lavagemService.setProgram(program.id, program.multiplier);
  }

  goToPayment() {
    this.router.navigate(['/lavagem/pagamento']);
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  get total() {
    return this.lavagemService.getTotalPrice();
  }

  isProgramSelected(program: WashingProgram): boolean {
    return this.selectedProgram.id === program.id;
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

