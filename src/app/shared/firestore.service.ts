import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { Game } from "./game.model";

@Injectable({providedIn: 'root'})
export class FirestoreService {

  constructor(private http: HttpClient) {}

  fetchPicksByDate(date: string) {
    const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/s2223/day_" + date + "/games"

    return this.http.get(url).pipe(
      map( response => {
        if (!response["documents"]) {return []}
        let output = []
        for (let game of response["documents"]) {
          output.push(this.process(game["fields"]));
        }
        return output;
      }
      )
    )
  }

  process(respObj): Game {
    let respFav = respObj.fav.stringValue;
    let respLine = respObj.line.stringValue;
    let respDog = respObj.dog.stringValue;
    let respScore = respObj.score.stringValue;
    let home = respObj.score.stringValue;
    let ats_win = respObj.ats_win.stringValue;
    return new Game(respFav, respLine, respDog, respScore, home, ats_win)
  }
}