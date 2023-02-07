import { Injectable } from "@angular/core";
import { map, tap } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { Game } from "./game.model";
import { DayPicks, SinglePick } from "./pick.interface";

@Injectable({providedIn: 'root'})
export class SeenDataService {
    public userPicks: { [date: string] : DayPicks } = {};
    public gamesByDay: { [date: string] : Game[] } = {};
    public teamData = {};

    constructor(private fire: FirestoreService) { }

    getPicks(date: string) {
        return this.fire.fetchUserPicks(date).pipe(
            tap( (response: DayPicks) => { this.userPicks[date] = response; } )
        )
    }

    getGames(date: string) {
        return this.fire.fetchGamesByDate(date).pipe(
            tap( (response: Game[] ) => { this.gamesByDay[date] = response; } )
        )
    }

    makePicks(date: string, selections: any) {
        //selections is just {gameno: pick}. we need to append docids here if they exist
        //including for the games that need to get deleted!
        const totg = this.gamesByDay[date].length;
        let doc_id = ''; let username = '';
        console.log(this.userPicks)
        if (this.userPicks[date].doc_id) {
            doc_id = this.userPicks[date].doc_id;
            username = this.userPicks[date].user;
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
                if (! this.userPicks[date].doc_id) {
                    let slashsplit = response["name"].split("/");
                    this.userPicks[date] = picks;
                    this.userPicks[date].doc_id = slashsplit[slashsplit.length -1];
                    this.userPicks[date].user = response["fields"]["user"]["stringValue"];
                }
            } ),
            map( () => { return selections } )
        )
    }

    sawPicks(date: string): boolean {
        return !!this.userPicks && date in this.userPicks
    }

    sawDate(date:string): boolean { 
        return !!this.gamesByDay && date in this.gamesByDay;
    }
}