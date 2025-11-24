import { Injectable } from '@angular/core';

export interface HistoryEntry {
  id: string;
  type: 'secagem' | 'lavagem';
  label: string;
  price: number;
  date: string;
  time: string;
  userEmail: string;
  machineWeight?: number;
  duration?: number;
  program?: string;
  cycles?: number;
  paymentMethod?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly STORAGE_KEY = 'laundry_history';

  addEntry(entry: Omit<HistoryEntry, 'id' | 'date' | 'time' | 'userEmail'>) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      return;
    }

    const now = new Date();
    const history = this.getHistory();
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      ...entry,
      date: this.formatDate(now),
      time: this.formatTime(now),
      userEmail: userEmail,
    };

    history.unshift(newEntry);
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
    return allHistory
      .filter(entry => entry.userEmail === userEmail)
      .map(entry => ({
        ...entry,
        time: entry.time || '00:00'
      }));
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

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

