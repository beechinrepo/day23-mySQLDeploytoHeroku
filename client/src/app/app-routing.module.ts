import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { POComponent} from './components/po.component';
import { MainComponent } from './components/main.component';
import { UpdateComponent} from './components/update.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'order', component: POComponent },
  { path: 'order/:orderId', component: UpdateComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
