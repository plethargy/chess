import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  loggedIn = false;
  loggedInUser = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  ngAfterContentChecked() {
    this.authService.user.subscribe(
      (loggedInUser) => (this.loggedInUser = loggedInUser)
    );
    if (this.loggedInUser !== null) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
