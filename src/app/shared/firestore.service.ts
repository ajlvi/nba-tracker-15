import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment.development";
import { AuthService } from "../auth/auth.service";
import { FirestoreQueryService } from "./firestore-query.service";
import { Game, RecordData } from "./game.model";
import { SinglePick, DayPicks } from "./pick.interface";

@Injectable({providedIn: 'root'})
export class FirestoreService {
  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private queryService: FirestoreQueryService) {}

  fetchGamesByDate(date: string) {
    const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/"
      + environment.season + "/day_" + date;
    return this.http.get(url).pipe(
      map( response => {
        return this.pruneFetchedDate(response)
      })
    )
  }

  fetchTeamsData() {
    const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents:runQuery";
    return this.http.post(url, this.queryService.query_team_documents()).pipe(
      map( response => {
        console.log(response);
        return {};
        // return this.pruneFetchedGamesData(response)
      })
    )
  }

  pruneFetchedDate(response): Game[] {
    if (!response["fields"]) {return []}
    const fields = response["fields"]
    let output = [];
    for (let i = 0; i < parseInt(fields["totg"]["integerValue"]); i++) {
      const game_fav = fields["fav_" + i.toString()]["stringValue"];
      const game_line = fields["line_" + i.toString()]["stringValue"];
      const game_dog = fields["dog_" + i.toString()]["stringValue"];
      const game_home = fields["home_" + i.toString()]["stringValue"];
      let game_score = "";
      let game_ats = "";
      let game_time = 0;
      if (fields["score_" + i.toString()]) {
        game_score = fields["score_" + i.toString()]["stringValue"];
      }
      if (fields["ats_win_" + i.toString()]) {
        game_ats = fields["ats_win_" + i.toString()]["stringValue"];
      }
      if (fields["time_" + i.toString()]) {
        game_time = fields["time_" + i.toString()]["integerValue"];
      }
      output.push( new Game(game_fav, game_line, game_dog, game_home, game_score, game_ats, game_time))
    }
    return output;
  }

  fetchUserPicks(date: string) {
    const username = this.auth.currentEmail;
    const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents:runQuery"
    return this.http.post(url, this.queryService.query_player_picks_single(username, date)).pipe(
      map( response => {
        return this.pruneFetchedPicks(response, date)
      })
    )
  }
  
  pruneFetchedPicks(response, date) {
    //we looked for picks on this day and found nothing. we return something to indicate we looked
    if (!response[0]["document"]) { 
      return {
        "doc_id": '',
        "user": this.auth.currentEmail,
        "date": date
      } 
    }
    const document = response[0]["document"]
    let slashsplit = document["name"].split("/")
    let output: DayPicks = {
      "doc_id": slashsplit[slashsplit.length - 1],
      "user": document["fields"]["user"]["stringValue"],
      "date": document["fields"]["date"]["stringValue"]
    };
    for (let i=0; i <= 15; i++) {
      if (document["fields"]["pick_" + i.toString()]) {
        const pickedTeam = document["fields"]["pick_" + i.toString()]["stringValue"];
        let pick_i: SinglePick = {"pick": pickedTeam, "gameno": i}
        if (document["fields"]["result_" + i.toString()]) {
          pick_i["result"] = document["fields"]["result_" + i.toString()]["integerValue"]
        }
        output[i] = pick_i
      }
    }
    return output;
  }

  make_picks(date: string, selections: DayPicks) {
    const basepath = "https://firestore.googleapis.com/v1"
    if (selections.doc_id) {
      let write_suffix = "/projects/nba-8bb05/databases/(default)/documents:commit"
      return this.http.post(basepath + write_suffix, this.update_picks_payload(selections))
    }
    else {
      let write_suffix = "/projects/nba-8bb05/databases/(default)/documents/picks"
      return this.http.post(basepath + write_suffix, this.new_picks_payload(date, selections))
    }
  }

  update_picks_payload(selections: DayPicks) {
    const basepath = "projects/nba-8bb05/databases/(default)/documents/picks/"
    let outputObj = {"writes": []}
    let outputDoc = {
      "name": basepath + selections.doc_id,
      "fields": {
        "season": {"stringValue": environment.season},
        "user": {"stringValue": this.auth.currentEmail},
        "date": {"stringValue": selections.date}
      }
    }
    for (let i=0; i <= 15; i++) {
      if (selections[i]) {
        outputDoc["fields"]["pick_" + i.toString()] = {"stringValue": selections[i]["pick"]}
      }
    }
    outputObj["writes"].push({"update": outputDoc})
    return outputObj;
  }

  new_picks_payload(date: string, selections: DayPicks) {
    let outputDoc = {
      "fields": {
        "season": {"stringValue": environment.season},
        "user": {"stringValue": this.auth.currentEmail},
        "date": {"stringValue": date}
      }
    }
    for (let i=0; i <= 15; i++) {
      if (selections[i]) {
        outputDoc["fields"]["pick_" + i.toString()] = {"stringValue": selections[i]["pick"]}
      }
    }
    return outputDoc;
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