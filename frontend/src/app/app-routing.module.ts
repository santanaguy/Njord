import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapLayoutComponent } from './map-layout/map-layout.component';

const routes: Routes = [
  {path:'', component: MapLayoutComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
