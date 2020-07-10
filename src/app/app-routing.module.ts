import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Screens
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { GameComponent } from './screens/game/game.component';
import { AuthGuard } from './services/auth/auth.guard';
import { LeaderboardComponent } from './screens/leaderboard/leaderboard.component';
import { LobbiesComponent } from './screens/lobbies/lobbies.component';
import { GameResultComponent } from './screens/game-result/game-result.component';

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
    path: 'leaderboard',
    component: LeaderboardComponent,
    data: { animation: 'leaderboard' },
  },
  {
    path: 'lobbies',
    component: LobbiesComponent,
    data: { animation: 'lobbies' },
    canActivate: [AuthGuard],
  },
  {
    path: 'game-result',
    component: GameResultComponent,
    data: { animation: 'game-result' },
    canActivate: [AuthGuard],
  },
  {
    path: 'game-result/:result',
    component: GameResultComponent,
    data: { animation: 'game-result' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
