import { Component, OnInit } from '@angular/core';
import { Lobby } from '../lobbies/lobby'
import { Router } from '@angular/router'
import io from "socket.io-client"

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

  constructor(private router: Router) {
    this.openLobbies = [],
      this.TEMPNAME = "Player1",
      this.TEMPNAME2 = "Player2"
  }

  ngOnInit(): void {
    this.socket = io("http://localhost:4001");
    this.socket.on("lobbies", data => {
      this.openLobbies = [];
      for (let item of data) {
        this.openLobbies.push({ id: item.ID, player1: item.Player1, player2: item.Player2 })
      }
    })
  }

  addLobby(playerName: string): void {
    this.socket.emit("addLobby", playerName);
    this.router.navigateByUrl('/game');
  }

  joinLobby(id: number, playerName: string): void {
    this.socket.emit("joinLobby", id, playerName);
    this.router.navigateByUrl('/game');
  }

}
