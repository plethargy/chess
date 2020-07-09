import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import {
  RouterOutlet
} from '@angular/router';
import {
  trigger,
  transition,
  style,
  query,
  animate
} from '@angular/animations';
import {
  ThemeService
} from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // Set a default  style for enter and leave
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              left: 0,
              width: '100%',
              opacity: 0,
              transform: 'scale(0) translateY(100%)',
            }),
          ],
          { optional: true }
        ),
        // Animate the new page in
        query(
          ':enter',
          [
            animate(
              '600ms ease',
              style({
                opacity: 1,
                transform: 'scale(1) translateY(0)',
              })
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent {
  constructor(
    public themeService: ThemeService,
  ) { themeService.setLightTheme(); }

  title = 'chessApp';

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  toggleTheme() {
    if (this.themeService.isDarkTheme())
      this.themeService.setLightTheme();
    else
      this.themeService.setDarkTheme();
  }
}
