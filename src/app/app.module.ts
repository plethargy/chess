import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { AlertModule } from './_alert';
// Modules - Generated modules
import { ThemeModule } from './services/theme/theme.module';

// Components
import { AppComponent } from './app.component';
// Components - Layout
import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

// Components - Screens
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { GameComponent } from './screens/game/game.component';
import { SnackbarComponent } from './services/snackbar/snackbar.component';
import { SnackbarPromotionComponent } from './components/snackbar-promotion/snackbar-promotion.component';

// Components - Pieces
import { PawnComponent } from './components/pieces/pawn/pawn.component';
import { KnightComponent } from './components/pieces/knight/knight.component';
import { RookComponent } from './components/pieces/rook/rook.component';
import { KingComponent } from './components/pieces/king/king.component';
import { QueenComponent } from './components/pieces/queen/queen.component';
import { BishopComponent } from './components/pieces/bishop/bishop.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { LoadingSpinnerComponent } from './shared/loading-spinner.component';
import { SessionSetupComponent } from './screens/session-setup/session-setup.component';
import { LeaderboardComponent } from './screens/leaderboard/leaderboard.component';
import { LobbiesComponent } from './screens/lobbies/lobbies.component';
library.add(fas, far, fab);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    GameComponent,
    PawnComponent,
    KnightComponent,
    RookComponent,
    KingComponent,
    QueenComponent,
    BishopComponent,
    SnackbarComponent,
    SnackbarPromotionComponent,
    LoadingSpinnerComponent,
    SessionSetupComponent,
    LeaderboardComponent,
    LobbiesComponent,
  ],
  imports: [
    ThemeModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AlertModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
