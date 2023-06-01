import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { RecordData } from "./game.model";
import { DayPicks } from "./pick.interface";
import { TeamData, TeamGameResult } from "./team.interface";

@Injectable({providedIn: 'root'})
export class CommonService {
    public calendarEndDateSub = new BehaviorSubject<string>('');

    //determines the day previous to date; date is mmdd.
    previous_day(date: string) {
        const month = parseInt(date.slice(0, 2));
        const day = parseInt(date.slice(2));
        if (day >= 2) {
          return date.slice(0, 2) + ("00" + (day-1).toString()).slice(-2)
        }
        else {
          switch (month) {
            case 11: return "1031";
            case 12: return "1130";
            case 13: return "1231";
            case 14: return "1331";
            case 15:
              if ( parseInt(environment.season.slice(3))%4 === 0) { return "1429" }
              else { return "1428" }
            case 16: return "1531";
            case 17: return "1630";
            case 18: return "1731";
            default: console.log(date); return "xxxx";
          }
        }
      }

    //analyzes a DayPicks object to figure out the record on the picked games.
    record_on_day(picks: DayPicks) {
        let wins = 0;
        let losses = 0;
        let ties = 0;
        for (let i=0; i<= 15; i++) {
            if (picks[i]) {
              if (picks[i]["result"]) {
                const result = parseInt(picks[i]["result"])
                if (result === 1) {wins++;}
                else if (result === -1) {losses++;}
                else if (result === 0) {ties++;}
              }
            }
          }
        return new RecordData('', wins, losses, ties);
    }

    //takes a team document (returned from firestore) and converts it to TeamData format.
    process_team_document(document: any): TeamData {
        const fields = document["fields"]
        const ats_w = parseInt(fields["ats_w"]["integerValue"]);
        const ats_l = parseInt(fields["ats_l"]["integerValue"]);
        const ats_t = parseInt(fields["ats_t"]["integerValue"]);
        let totg = ats_w + ats_l + ats_t;
        let teamobj: TeamData = {"wins": ats_w, "losses": ats_l, "ties": ats_t, "totg": totg}
        for (let i=0; i < totg; i++) {
            let game_array = fields["game_" + i.toString()]["arrayValue"]["values"];
            let game_date = game_array[0]["stringValue"]
            let game_score = game_array[1]["stringValue"]
            let game_line = game_array[2]["stringValue"]
            let game_result = game_array[3]["stringValue"].toUpperCase()
            let gameobj: TeamGameResult = {
                "date": game_date, 
                "score": game_score, 
                "line": game_line, 
                "result": game_result
            };
            teamobj[i] = gameobj;
            teamobj[game_date] = gameobj;
        }
        return teamobj;
    }
}