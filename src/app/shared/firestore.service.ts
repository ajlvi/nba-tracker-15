import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment.development";
import { AuthService } from "../auth/auth.service";
import { Game, RecordData } from "./game.model";

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
      output.push(this.process_date_response(game["fields"]));
    }
    return output;
  }

  process_date_response(respObj): Game {
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
    const username = this.auth.currentEmail;
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
    const username = this.auth.currentEmail
    const write_suffix = "/projects/nba-8bb05/databases/(default)/documents:commit"
    const api_url = "https://firestore.googleapis.com/v1" + write_suffix;
    return this.http.post(api_url, this.make_payload(picks, date, username))
  }

  make_payload(picks: any, date: string, username: string) {
    //picks includes #: PICK as well as total: #
    let outputObj = {}
    const basepath = "projects/nba-8bb05/databases/(default)/documents/users/" +
      username + 
      "/" + environment.season +
      "/day_" + date
    outputObj["writes"] = [{"update": {"name": basepath, "fields": {}}}];
    for (let i=0; i < picks["total"]; i++) {
      let docpath = basepath + "/picks/" + i.toString()
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

  getUserStats() {
    const username = this.auth.currentEmail;
    const baseurl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/"
    let stats_suffix = username + "/" + environment.season + "/" + "stats"
    return this.http.get(baseurl + stats_suffix).pipe(
      catchError(this.handleError),
      map( response => {
        return this.process_stats_response(response)
      })
    )
  }

  process_stats_response(response) {
    const respWins = parseInt(response["fields"]["wins"]["integerValue"])
    const respLosses = parseInt(response["fields"]["losses"]["integerValue"])
    const respTies = parseInt(response["fields"]["ties"]["integerValue"])
    return new RecordData(respWins, respLosses, respTies);
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage = "Unknown error occurred :("
    if (!errorResponse.error || !errorResponse.error.error) {
        return throwError(errorMessage);
    }
    switch (errorResponse.error.error.status) {
        case 'NOT_FOUND':
            return new Observable( subscriber => {
              subscriber.next(new RecordData(-1, -1, -1));
            });
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = "You have tried logging in too many times; try later."; break;
        case 'EMAIL_NOT_FOUND':
            errorMessage = "No account is associated with that e-mail address."; break;
        case "INVALID_PASSWORD":
            errorMessage = "Your password was incorrect."; break;
    }
    return throwError(errorMessage);
}
}