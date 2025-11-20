import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HistoryService, HistoryEntry } from './history.service';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistoricoPage implements OnInit {
  history: HistoryEntry[] = [];

  constructor(
    private router: Router,
    private historyService: HistoryService
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.history = this.historyService.getHistory();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',') + '€';
  }

  getTypeClass(type: string): string {
    return type === 'secagem' ? 'type-secagem' : 'type-lavagem';
  }
}

