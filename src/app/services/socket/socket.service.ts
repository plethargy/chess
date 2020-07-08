import { Injectable, OnInit } from '@angular/core';
import io from "socket.io-client"

const url = "http://localhost:4001";
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any;
  sessionID: any;

  constructor() {
    this.socket = io(url);
    this.socket.on("newGame", data => {
      this.sessionID = data.SessionID;
    })
    this.socket.on("joinGame", data => {
      this.sessionID = data.SessionID;
    })
  }
}
