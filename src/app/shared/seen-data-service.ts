import { Injectable } from "@angular/core";
import { map, switchMap, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";
import { CommonService } from "./common.service";
import { FirestoreService } from "./firestore.service";
import { Game, RecordData } from "./game.model";
import { DayPicks, SinglePick } from "./pick.interface";
import { TeamData } from "./team.interface";
import { UserData } from "./user-data.interface";

@Injectable({providedIn: 'root'})
export class SeenDataService {
    public seenPicks: { [user: string] : {[date: string]: DayPicks} } = {};
    public gamesByDay: { [date: string] : Game[] } = {};
    public recordData: { [user: string] : RecordData } = {};
    public teamData: { [team: string] : TeamData } = {};
    public UserData: { [user: string] : UserData } = {};
    public GroupRosters: { [group: string] : string[] } = {};

    constructor(
        private fire: FirestoreService, 
        private auth: AuthService,
        private common: CommonService) { }

    getPicks(user: string, date: string) {
        return this.fire.fetchUserPicksSingle(user, date).pipe(
            tap( (response: DayPicks) => { this.setPicks(user, date, response) } )
        )
    }

    getMultiplePicks(users: string[], daterange: string[]) {
        return this.fire.fetchUserPicksMultiple(users, daterange).pipe(
            tap ( (response: {[user: string]: {[date: string]: DayPicks}} ) => {
                for (let user in response) {
                    for (let date of daterange) {
                        this.setPicks(user, date, response[user][date])
                    }
                }
            })
        )
    }

    getGames(date: string) {
        return this.fire.fetchGamesByDate(date).pipe(
            tap( (response: Game[] ) => { this.gamesByDay[date] = response; } )
        )
    }

    getTeamData() {
        return this.fire.fetchTeamsData().pipe(
            tap ( (response: any[]) => {
                for (let i=0; i < response.length; i++) {
                    const teamname = response[i]["document"]["fields"]["team"]["stringValue"]
                    this.teamData[teamname] = this.common.process_team_document(response[i]["document"]);
                }
            })
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

    getUserData(email: string) {
        return this.fire.fetchUserData(email).pipe(
            tap( (response: {"userdata": UserData, "record": RecordData}) => {
                this.UserData[email] = response["userdata"]; 
                this.recordData[email] = response["record"]
            } 
            )
        )
    }

    getGroupRoster(groupname: string) {
        return this.fire.findGroupMembers(groupname).pipe(
            tap( (response: Object[] ) => {
                //we should get back users-collection documents here; let's process them
                let roster = [];
                for (let doc of response) {
                    if (doc["document"]) {
                        let fields = doc["document"]["fields"];
                        const user: string = fields["user"]["stringValue"]
                        const w = parseInt(fields[environment.season + "_w"]["integerValue"])
                        const l = parseInt(fields[environment.season + "_l"]["integerValue"])
                        const t = parseInt(fields[environment.season + "_t"]["integerValue"])
                        roster.push(user);
                        if (! (user in this.recordData) ) {
                            this.recordData[user] = new RecordData(user, w, l, t);
                        }
                        //we don't want to overwrite the current user's data since it has groups
                        if (! (user in this.UserData) ) {
                            const handle = fields["handle"]["stringValue"]
                            this.UserData[user] = {"email": user, "handle": handle}
                        }
                    }
                }
                this.GroupRosters[groupname] = roster;
            })
        );
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
        this.seenPicks[user][date] = picks
    }

    setHandle(user: string, newHandle: string) {
        return this.fire.setHandle(user, newHandle).pipe(
            tap( () => {this.UserData[user]["handle"] = newHandle; })
        )
    }

    setGroups(user: string, groupNames: string[]) {
        return this.fire.setGroups(user, groupNames).pipe(
            tap( () => {this.UserData[user]["groups"] = groupNames; })
        )
    }

    sawPicks(user: string, date: string): boolean { 
        return (!!this.seenPicks[user]) && (date in this.seenPicks[user]); 
    }

    sawDate(date: string): boolean { return date in this.gamesByDay; }

    sawRecord(username: string): boolean { return username in this.recordData; }

    sawTeamData(): boolean {return !this.teamData}

    sawUser(email: string): boolean { return email in this.UserData; }

    sawGroup(name: string): boolean { return name in this.GroupRosters; }
}