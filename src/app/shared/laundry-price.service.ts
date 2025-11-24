import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LaundryPriceService {
  private baseWashingPrices = {
    6: 2.5,   // 6Kg
    9: 3.5,   // 9Kg
    15: 5.5   // 15Kg
  };

  private baseDryingPrices = {
    6: 3.5,   // 6Kg
    9: 4.5,   // 9Kg
    15: 6.5   // 15Kg
  };

  getPriceMultiplier(): number {
    const selectedLaundry = localStorage.getItem('selectedLaundry');
    if (!selectedLaundry) {
      return 1.0;
    }
    try {
      const laundry = JSON.parse(selectedLaundry);
      return laundry.priceMultiplier || 1.0;
    } catch {
      return 1.0;
    }
  }

  getWashingPrice(weightKg: number): number {
    const basePrice = this.baseWashingPrices[weightKg as keyof typeof this.baseWashingPrices] || 2.5;
    const multiplier = this.getPriceMultiplier();
    return Number((basePrice * multiplier).toFixed(2));
  }

  getDryingPrice(weightKg: number): number {
    const basePrice = this.baseDryingPrices[weightKg as keyof typeof this.baseDryingPrices] || 3.5;
    const multiplier = this.getPriceMultiplier();
    return Number((basePrice * multiplier).toFixed(2));
  }
}

