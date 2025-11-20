import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecarPage } from './secar/secar.page';
import { SecarCiclosPage } from './secar-ciclos/secar-ciclos.page';
import { SecarPagamentoPage } from './secar-pagamento/secar-pagamento.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'secar',
    pathMatch: 'full',
  },
  {
    path: 'secar',
    component: SecarPage,
  },
  {
    path: 'ciclos',
    component: SecarCiclosPage,
  },
  {
    path: 'pagamento',
    component: SecarPagamentoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecagemRoutingModule {}

