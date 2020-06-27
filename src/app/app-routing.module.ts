import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Screens
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { GameComponent } from './screens/game/game.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent, data: { animation: 'home' } },
  { path: 'login', component: LoginComponent, data: { animation: 'login' } },  
  { path: 'game', component: GameComponent, data: { animation: 'game' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
