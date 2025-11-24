import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LavagemRoutingModule } from './lavagem-routing.module';
import { LavarPage } from './lavar/lavar.page';
import { LavarCiclosPage } from './lavar-ciclos/lavar-ciclos.page';
import { LavarPagamentoPage } from './lavar-pagamento/lavar-pagamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LavagemRoutingModule,
    LavarPage,
    LavarCiclosPage,
    LavarPagamentoPage,
  ],
})
export class LavagemModule {}

