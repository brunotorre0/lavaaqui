import { Injectable } from '@angular/core';

export interface HistoryEntry {
  id: string;
  type: 'secagem' | 'lavagem';
  label: string;
  price: number;
  date: string; // formato: DD/MM/YYYY
  userEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly STORAGE_KEY = 'laundry_history';

  addEntry(entry: Omit<HistoryEntry, 'id' | 'date' | 'userEmail'>) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      return;
    }

    const history = this.getHistory();
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      ...entry,
      date: this.formatDate(new Date()),
      userEmail: userEmail,
    };

    history.unshift(newEntry); // Adiciona no início
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  getHistory(): HistoryEntry[] {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      return [];
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const allHistory: HistoryEntry[] = JSON.parse(stored);
    // Filtrar apenas histórico do utilizador atual
    return allHistory.filter(entry => entry.userEmail === userEmail);
  }

  clearHistory() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      return;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return;
    }

    const allHistory: HistoryEntry[] = JSON.parse(stored);
    const filteredHistory = allHistory.filter(entry => entry.userEmail !== userEmail);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

