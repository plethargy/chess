import { Component, OnInit } from '@angular/core';
import { Lobby } from './lobby'
import { Router } from '@angular/router'
import io from "socket.io-client"
import { SocketService } from '../../services/socket/socket.service'

@Component({
  selector: 'app-lobbies',
  templateUrl: './lobbies.component.html',
  styleUrls: ['./lobbies.component.css']
})
export class LobbiesComponent implements OnInit {

  openLobbies: Lobby[];
  TEMPNAME: string;
  TEMPNAME2: string;

  private socket: any;

  constructor(private router: Router, private socketService: SocketService) {
    this.openLobbies = [],
      this.TEMPNAME = "Player1",
      this.TEMPNAME2 = "Player2"
    this.socket = socketService.socket;
  }

  ngOnInit(): void {
    //this.socket = io("http://localhost:4001");
    this.socket.emit("getLobbies");
    //console.log(this.socketService);
    this.socket.on("lobbies", data => {
      this.openLobbies = [];
      for (let item of data) {
        this.openLobbies.push({ id: item.ID, player1: item.Player1, player2: item.Player2 })
      }
    })

    console.log(this.socketService.newGame());
    this.socket.on("newGame", data => {
      console.log(data);
    })
  }

  addLobby(playerName: string): void {
    this.socket.emit("addLobby", playerName);
    this.router.navigateByUrl('/game');
  }

  joinLobby(id: string, playerName: string): void {
    this.socket.emit("joinLobby", id, playerName);
    this.socket.on("joinGame", data => {
      console.log(data);
    })
    this.TESTSOCKETMETHODS(id);
    this.router.navigateByUrl('/game');
  }

  TESTSOCKETMETHODS(sessionID: string) {
    this.socket.emit("move", sessionID, 'a4');
    this.socket.on("moveResult", data => {
      console.log(data);
    })
  }


}
