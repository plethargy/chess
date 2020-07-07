import { Injectable, OnInit } from '@angular/core';
import io from "socket.io-client"

const url = "http://localhost:4001";
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any;

  constructor() {
    this.socket = io(url);
  }
}
