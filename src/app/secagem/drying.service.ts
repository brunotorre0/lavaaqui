import { Injectable } from '@angular/core';

export interface DryerMachine {
  id: number;
  label: string;
  weightKg: number;
  durationMinutes: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class DryingService {
  private selectedMachine: DryerMachine | null = null;
  private cycles = 20;

  selectMachine(machine: DryerMachine) {
    this.selectedMachine = machine;
    this.cycles = 20;
  }

  getSelectedMachine(): DryerMachine | null {
    return this.selectedMachine;
  }

  setCycles(value: number) {
    this.cycles = value;
  }

  getCycles(): number {
    return this.cycles;
  }

  getTotalPrice(): number {
    if (!this.selectedMachine) {
      return 0;
    }
    const multiplier = this.cycles / 20;
    const total = this.selectedMachine.price * multiplier;
    return Number(total.toFixed(2));
  }

  getSummary() {
    if (!this.selectedMachine) {
      return null;
    }
    return {
      machine: this.selectedMachine,
      cycles: this.cycles,
      total: this.getTotalPrice(),
    };
  }

  reset() {
    this.selectedMachine = null;
    this.cycles = 20;
  }
}

