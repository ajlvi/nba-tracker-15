import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { map, tap } from "rxjs/operators";

import { environment } from "src/environments/environment.development";
import { AuthService } from "../auth/auth.service";
import { FirestoreQueryService } from "./firestore-query.service";
import { Game, RecordData } from "./game.model";
import { SinglePick, DayPicks } from "./pick.interface";

@Injectable({providedIn: 'root'})
export class FirestoreService {
  queryUrl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents:runQuery"

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
    return this.http.post(this.queryUrl, this.queryService.query_team_documents())
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

  fetchUserPicksSingle(user: string, date: string) {
    return this.http.post(
      this.queryUrl, 
      this.queryService.query_player_picks_single(user, date)
    ).pipe(
      map( response => {
        //we looked for picks on this day and found nothing. we return something to indicate we looked
        if (!response[0]["document"]) { 
          return {
            "doc_id": '',
            "user": this.auth.currentEmail,
            "date": date
          } 
        }
        return this.pruneFetchedPicks(response[0])
      })
    )
  }

  fetchUserPicksMultiple(user: string, daterange: string[]) {
    let output = {}
    return this.http.post(
      this.queryUrl,
      this.queryService.query_player_picks_multiple(user, daterange[0], daterange[6])
    ).pipe(
      map( (response: any[]) => {
        // first we'll take the successes and store those.
        for (let document of response) {
          output[document["document"]["fields"]["date"]["stringValue"]] = this.pruneFetchedPicks(document)
        }
        // since we looked and didn't find the other dates, we'll store a reminder.
        for (let date of daterange) {
          if (!(date in output)) {
            output[date] = {
              "doc_id": '',
              "user": this.auth.currentEmail,
              "date": date
            } 
          }
        }
        return output
      })
    )
  }
  
  pruneFetchedPicks(response) {
    const document = response["document"]
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

  setHandle(email: string, newHandle: string) {
    const baseurl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/"
    let user_suffix = email + "/"
    let query_params = new HttpParams().set("updateMask.fieldPaths", "handle")
    let payload = {"fields": {"handle": {"stringValue": newHandle}}}
    return this.http.patch(baseurl + user_suffix, payload, {params: query_params})
  }

  setGroups(email: string, groupNames: string[]) {
    const baseurl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/";
    let user_suffix = email + "/";
    let query_params = new HttpParams().set("updateMask.fieldPaths", "groups");
    let payload = {
      "fields": {
        "groups": {
          "arrayValue": {
            "values": this.groupNamesPayload(groupNames)
          }
        }
      }
    };
    return this.http.patch(baseurl + user_suffix, payload, {params: query_params})
  }

  groupNamesPayload(groupNames: string[]) {
    let payload = []
    for (let i=0; i < groupNames.length; i++) {
      payload.push( {"stringValue": groupNames[i]} );
    }
    return payload;
  }

  fetchUserData(email: string) {
    const baseurl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/"
    let user_suffix = email + "/"
    return this.http.get(baseurl + user_suffix).pipe(
      catchError(this.handleError),
      map( response => {
        return this.process_userdata_response(response)
      })
    )
  }

  process_userdata_response(response) {
    const handle = response["fields"]["handle"]["stringValue"]
    const email = response["fields"]["user"]["stringValue"]
    let groups = []
    for (let group of response["fields"]["groups"]["arrayValue"]["values"]) {
      groups.push(group["stringValue"])
    }
    return {"handle": handle, "groups": groups, "email": email}
  }

  fetchUserStats() {
    const username = this.auth.currentEmail;
    const baseurl = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/users/"
    let stats_suffix = username + "/"
    return this.http.get(baseurl + stats_suffix).pipe(
      catchError(this.handleError),
      map( response => {
        return this.process_stats_response(response, username)
      })
    )
  }

  process_stats_response(response, username: string) {
    const season = environment.season
    const respWins = parseInt(response["fields"][season + "_w"]["integerValue"])
    const respLosses = parseInt(response["fields"][season + "_l"]["integerValue"])
    const respTies = parseInt(response["fields"][season + "_t"]["integerValue"])
    return new RecordData(username, respWins, respLosses, respTies);
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage = "Unknown error occurred :("
    if (!errorResponse.error || !errorResponse.error.error) {
        return throwError(errorMessage);
    }
    switch (errorResponse.error.error.status) {
        case 'NOT_FOUND':
            return new Observable( subscriber => {
              subscriber.next(new RecordData('', -1, -1, -1));
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