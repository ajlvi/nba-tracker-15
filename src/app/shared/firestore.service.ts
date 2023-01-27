import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaustMap, map, mergeMap, switchMap, take } from "rxjs";
import { environment } from "src/environments/environment.development";
import { AuthService } from "../auth/auth.service";
import { Game } from "./game.model";

@Injectable({providedIn: 'root'})
export class FirestoreService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  fetchPicksByDate(date: string) {
    const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/"
      + environment.season 
      + "/day_" + date 
      + "/games";

    return this.http.get(url).pipe(
      map( response => {
        return this.pruneFetchedDate(response)
      }
      )
    )
  }

  pruneFetchedDate(response) {
    if (!response["documents"]) {return []}
    let output = []
    for (let game of response["documents"]) {
      output.push(this.process(game["fields"]));
    }
    return output;
  }

  process(respObj): Game {
    let respFav = respObj.fav.stringValue;
    let respLine = respObj.line.stringValue;
    let respDog = respObj.dog.stringValue;
    let respHome = respObj.home.stringValue;
    let respScore = '';
    let respATS = ''; 
    let respTime = ''; 
    if (respObj.score) {respScore = respObj.score.stringValue;}
    if (respObj.ats_win) {respATS = respObj.ats_win.stringValue;}
    if (respObj.time) {respTime = respObj.time.integerValue;}
    return new Game(respFav, respLine, respDog, respHome, respScore, respATS, respTime)
  }

  fetchUserPicks(date: string) {
    return this.auth.user.pipe(
      take(1),
      switchMap( user => {
        const username = user.email;
        const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/"
        + username + "/" 
        + environment.season + "/"
        + "day_" + date + "/"
        + "picks";
        return this.http.get(url).pipe(
          map( response => {
            return this.pruneFetchedPicks(response)
          })
        )
      })
    )
  }
  
  pruneFetchedPicks(response) {
    if (!response["documents"]) { return {} }
    let output = {};
    for (let game of response["documents"]) {
      const slashSplit = game["name"].split("/")
      const gameNumber = parseInt(slashSplit[slashSplit.length - 1]);
      const pickedTeam = game["fields"]["pick"]["stringValue"]
      output[gameNumber] = pickedTeam;
    }
    return output;
  }


  make_picks(picks: any, date: string) {
    return this.auth.user.pipe(
      take(1),
      exhaustMap( user => {
        const username = user.email;
        const write_suffix = "/projects/nba-8bb05/databases/(default)/documents:commit"
        const picks_url = "https://firestore.googleapis.com/v1" + write_suffix;
        return this.http.post(picks_url, this.make_payload(picks, date, username));
      } )
    );
  }

  make_payload(picks: any, date: string, username: string) {
    //picks includes #: PICK as well as total: #
    let outputObj = {}
    outputObj["writes"] = [];
    for (let i=0; i < picks["total"]; i++) {
      let docpath = 
          "projects/nba-8bb05/databases/(default)/documents/users/" +
          username + 
          "/" + environment.season +
          "/day_" + date +
          "/picks/" + i.toString()
      if (picks[i]) {
        let document = {
          "name": docpath,
          "fields": {"pick": {'stringValue': picks[i]}}
        }
        outputObj["writes"].push({
          "update": document
        })
      }
      else {
        outputObj["writes"].push( {
          "delete" : docpath
        } )
      }
    } 
    return outputObj;
  }

  create_user(user) {
    //
  }
}