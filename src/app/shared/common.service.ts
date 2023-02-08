import { Injectable } from "@angular/core";
import { RecordData } from "./game.model";
import { DayPicks } from "./pick.interface";

@Injectable({providedIn: 'root'})
export class CommonService {
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
}