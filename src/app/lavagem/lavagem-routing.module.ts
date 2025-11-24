import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LavarPage } from './lavar/lavar.page';
import { LavarCiclosPage } from './lavar-ciclos/lavar-ciclos.page';
import { LavarPagamentoPage } from './lavar-pagamento/lavar-pagamento.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lavar',
    pathMatch: 'full',
  },
  {
    path: 'lavar',
    component: LavarPage,
  },
  {
    path: 'ciclos',
    component: LavarCiclosPage,
  },
  {
    path: 'pagamento',
    component: LavarPagamentoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LavagemRoutingModule {}

