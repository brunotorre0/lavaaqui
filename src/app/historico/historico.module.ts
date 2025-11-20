import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoricoRoutingModule } from './historico-routing.module';
import { HistoricoPage } from './historico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoricoRoutingModule,
    HistoricoPage,
  ],
})
export class HistoricoModule {}

