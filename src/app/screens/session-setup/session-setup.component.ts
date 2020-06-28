import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-session-setup',
  templateUrl: './session-setup.component.html',
  styleUrls: ['./session-setup.component.css'],
})
export class SessionSetupComponent implements OnInit {
  isLoading = false;
  isLoginMode = true;
  // Can use this error var to display any error occured within creation of joining of session
  error: string = null;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const sessionID = form.value.sessionID;

    // Use sessionID as the ID to join

    // If valid sessionID -> Join game
    this.router.navigate(['/game']);

    // Otherwise throw error string into this.error

    form.reset();
  }

  onCreateSession() {
    // Here create the session for sockets and redirect to game
    // this.router.navigate(['/game']);
  }
}
