import { Injectable } from "@angular/core";
import { map, tap } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { CommonService } from "./common.service";
import { FirestoreService } from "./firestore.service";
import { Game, RecordData } from "./game.model";
import { DayPicks, SinglePick } from "./pick.interface";

@Injectable({providedIn: 'root'})
export class SeenDataService {
    public seenPicks: { [user: string] : {[date: string]: DayPicks} } = {};
    public gamesByDay: { [date: string] : Game[] } = {};
    public recordData: { [user: string] : RecordData } = {};
    public teamData = {};

    constructor(
        private fire: FirestoreService, 
        private auth: AuthService,
        private common: CommonService) { }

    getPicks(user: string, date: string) {
        return this.fire.fetchUserPicksSingle(user, date).pipe(
            tap( (response: DayPicks) => { this.setPicks(user, date, response) } )
        )
    }

    getMultiplePicks(user: string, daterange: string[]) {
        return this.fire.fetchUserPicksMultiple(user, daterange).pipe(
            tap ( (response: {[date: string]: DayPicks}) => {
                for (let date of daterange) { 
                    this.setPicks(user, date, response[date])
                }
            })
        )
    }

    getGames(date: string) {
        return this.fire.fetchGamesByDate(date).pipe(
            tap( (response: Game[] ) => { this.gamesByDay[date] = response; } )
        )
    }

    makePicks(date: string, selections: any) {
        //selections is just {gameno: pick}. only the default user can make picks.
        const totg = this.gamesByDay[date].length;
        let doc_id = ''; let username = this.auth.currentEmail;
        if (this.seenPicks[username][date].doc_id) {
            doc_id = this.seenPicks[username][date].doc_id;
        }
        let picks: DayPicks = {doc_id: doc_id, user: username, date: date};
        for (let i in selections) {
            if (selections[i]) {
                let pick_i: SinglePick = {"pick": selections[i], gameno: parseInt(i)}
                picks[i] = pick_i
            }
        }
        return this.fire.make_picks(date, picks).pipe(
            tap( (response ) => { 
                console.log(response)
                if (! this.seenPicks[username][date].doc_id) {
                    let slashsplit = response["name"].split("/");
                    this.seenPicks[username][date] = picks;
                    this.seenPicks[username][date].doc_id = slashsplit[slashsplit.length -1];
                    this.seenPicks[username][date].user = response["fields"]["user"]["stringValue"];
                }
            } ),
            map( () => { return selections } )
        )
    }

    getUserStats() {
        return this.fire.getUserStats().pipe(
            tap( (response: RecordData) => { this.recordData[response.user] = response } )
        )
    }

    recordOverRange(user: string, daterange: string[]) {
        let wins = 0; let losses = 0; let ties = 0;
        for (let date of daterange) {
            if (this.seenPicks[user][date]) {
                let day_rec = this.common.record_on_day(this.seenPicks[user][date])
                wins = wins + day_rec.wins; losses = losses + day_rec.losses; ties = ties + day_rec.ties;
            }
        }
        return new RecordData(user, wins, losses, ties);
    }

    setPicks(user: string, date: string, picks: DayPicks) {
        if (!this.seenPicks[user]) { this.seenPicks[user] = {} }
        { this.seenPicks[user][date] = picks }
    }

    sawPicks(user: string, date: string): boolean { 
        return (!!this.seenPicks[user]) && (date in this.seenPicks[user]); 
    }

    sawDate(date: string): boolean { return date in this.gamesByDay; }

    sawRecord(username: string): boolean { return username in this.recordData; }
}