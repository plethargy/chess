import { Component, OnInit } from '@angular/core';
import { Lobby } from './lobby';
import { Router } from '@angular/router';
import io from 'socket.io-client';
import { SocketService } from '../../services/socket/socket.service';
import { PlayerlookupService } from 'src/app/services/playerlookup/playerlookup.service';

@Component({
  selector: 'app-lobbies',
  templateUrl: './lobbies.component.html',
  styleUrls: ['./lobbies.component.css'],
})
export class LobbiesComponent implements OnInit {
  openLobbies: Lobby[];
  alertValue: string;

  private socket: any;

  playerLookup: PlayerlookupService;

  constructor(
    private router: Router,
    private socketService: SocketService,
    private playerLookupService: PlayerlookupService
  ) {
    (this.openLobbies = []);
    this.socket = socketService.socket;
    this.playerLookup = playerLookupService;
  }

  ngOnInit(): void {
    this.socket.emit('getLobbies');

    this.socket.on('lobbies', (data) => {
      this.openLobbies = [];
      for (let item of data) {
        this.openLobbies.push({
          id: item.ID,
          player1: item.Player1,
          player2: item.Player2,
        });
      }
    });
  }

  addLobby(): void {
    let user: any = JSON.parse(localStorage.getItem('userData'));
    this.socket.emit('addLobby', user.email);
    this.socket.on('newGame', (data) => {
      this.playerLookup.addUser(user.email, 'white');
      //need to setup proper navigation to specific session
      this.router.navigateByUrl('/game');
    });
  }

  joinLobby(id: string): void {
    let user: any = JSON.parse(localStorage.getItem('userData'));
    this.socket.emit('joinLobby', id, user.email);
    this.socket.on('joinGame', (data) => {
      this.playerLookup.addUser(user.email, 'black');
      //need to setup proper navigation to specific session
      this.router.navigateByUrl('/game');
    });
  }
}
