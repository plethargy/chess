import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Screens
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { GameComponent } from './screens/game/game.component';
import { AuthGuard } from './services/auth/auth.guard';
import { SessionSetupComponent } from './screens/session-setup/session-setup.component';
import { LeaderboardComponent } from './screens/leaderboard/leaderboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { animation: 'home' } },
  { path: 'login', component: LoginComponent, data: { animation: 'login' } },
  {
    path: 'game',
    component: GameComponent,
    data: { animation: 'game' },
    canActivate: [AuthGuard],
  },
  {
    path: 'session-setup',
    component: SessionSetupComponent,
    data: { animation: 'session-setup' },
    canActivate: [AuthGuard],
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    data: { animation: 'leaderboard' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
