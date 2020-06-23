import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Screens
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
