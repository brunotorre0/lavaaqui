import { Injectable } from '@angular/core';

export interface WashingMachine {
  id: number;
  label: string;
  weightKg: number;
  durationMinutes: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class LavagemService {
  private selectedMachine: WashingMachine | null = null;
  private programId: string = 'normal';
  private programMultiplier: number = 1.0;

  selectMachine(machine: WashingMachine) {
    this.selectedMachine = machine;
    this.programId = 'normal';
    this.programMultiplier = 1.0;
  }

  getSelectedMachine(): WashingMachine | null {
    return this.selectedMachine;
  }

  setProgram(programId: string, multiplier: number) {
    this.programId = programId;
    this.programMultiplier = multiplier;
  }

  getProgramId(): string {
    return this.programId;
  }

  getProgramMultiplier(): number {
    return this.programMultiplier;
  }

  setCycles(value: number) {
  }

  getCycles(): number {
    return 20;
  }

  getTotalPrice(): number {
    if (!this.selectedMachine) {
      return 0;
    }
    const total = this.selectedMachine.price * this.programMultiplier;
    return Number(total.toFixed(2));
  }

  getSummary() {
    if (!this.selectedMachine) {
      return null;
    }
    return {
      machine: this.selectedMachine,
      programId: this.programId,
      programMultiplier: this.programMultiplier,
      total: this.getTotalPrice(),
    };
  }

  reset() {
    this.selectedMachine = null;
    this.programId = 'normal';
    this.programMultiplier = 1.0;
  }
}
