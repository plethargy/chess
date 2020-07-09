import { Injectable, OnInit } from '@angular/core';
import io from 'socket.io-client';
import { AlertService } from '../../_alert';

// const url = 'https://grad-chess-api.herokuapp.com/';
const url = 'http://localhost:4001';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  sessionID: any;
  manager: any;

  constructor(public alertService: AlertService) {
    this.socket = io(url, {
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 3000,
      randomizationFactor: 0,
    });
    // this.socket.io._reconnectionAttempts = 2;

    this.socket.on('newGame', (data) => {
      this.sessionID = data.SessionID;
    });
    this.socket.on('joinGame', (data) => {
      this.sessionID = data.SessionID;
    });
    this.socket.on('connected', () => {});
    console.log(this.socket);
    this.socket.on('disconnect', (reason) => {
      //maybe add custom messages for reason?
      alertService.error('Lost connection to server');
    });
    this.socket.on('reconnect', (attemptNumber) => {
      alertService.clear();
      alertService.success('Reconnected to server successfully', {
        autoClose: true,
      });
    });
    this.socket.on('reconnecting', (attemptNumber) => {
      alertService.clear();
      alertService.error(
        "Couldn't connect to server: Reconnect attempt " + attemptNumber
      );
    });
    this.socket.on('reconnect_failed', () => {
      alertService.clear();
      alertService.error("Couldn't connect to server: Something went wrong ");
    });
  }
}
