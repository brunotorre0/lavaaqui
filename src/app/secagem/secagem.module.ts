import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SecagemRoutingModule } from './secagem-routing.module';
import { SecarPage } from './secar/secar.page';
import { SecarCiclosPage } from './secar-ciclos/secar-ciclos.page';
import { SecarPagamentoPage } from './secar-pagamento/secar-pagamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecagemRoutingModule,
    SecarPage,
    SecarCiclosPage,
    SecarPagamentoPage,
  ],
})
export class SecagemModule {}

