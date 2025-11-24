import { Injectable } from '@angular/core';

export interface HistoryEntry {
  id: string;
  type: 'secagem' | 'lavagem';
  label: string;
  price: number;
  date: string; // formato: DD/MM/YYYY
  time: string; // formato: HH:MM
  userEmail: string;
  // Informações adicionais
  machineWeight?: number; // peso da máquina em kg
  duration?: number; // duração em minutos
  program?: string; // programa usado (normal, delicado, etc) - apenas para lavagem
  cycles?: number; // número de ciclos - apenas para secagem
  paymentMethod?: string; // método de pagamento usado
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
    // Filtrar apenas histórico do utilizador atual e garantir compatibilidade com dados antigos
    return allHistory
      .filter(entry => entry.userEmail === userEmail)
      .map(entry => ({
        ...entry,
        time: entry.time || '00:00' // Valor padrão para dados antigos
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

