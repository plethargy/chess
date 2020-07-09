import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerlookupService {

  lookupTable = new Map<string, string>();

  constructor() { }

  public addUser(playerName : string, playerColour: string) : void
  {
    this.lookupTable.set(playerName, playerColour);
  }

  public getUserColour(playerName : string) : string
  {
    return this.lookupTable.get(playerName);
  }


}
