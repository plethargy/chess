import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserLeaderboard } from './userLeaderboard.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
  isLoading = false;
  error: string = null;

  // Should generate this list dynamically
  leaderboardList = [
    new UserLeaderboard(1, 'Enjoy', 121),
    new UserLeaderboard(2, 'Doing', 99),
    new UserLeaderboard(3, 'The', 95),
    new UserLeaderboard(4, 'Project', 85),
    new UserLeaderboard(5, 'Guys', 80),
    new UserLeaderboard(6, 'And', 75),
    new UserLeaderboard(7, 'Remember', 20),
    new UserLeaderboard(8, 'To', 18),
    new UserLeaderboard(9, 'Smile', 15),
    new UserLeaderboard(10, ':) ;)', 1),
  ];

  constructor() {}

  ngOnInit(): void {}
}
