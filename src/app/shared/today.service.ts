import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class TodayService {
    todaySubject = new BehaviorSubject<string>(null);

    constructor(private http: HttpClient) {}

    getTodaysDate() {
        const url = "https://firestore.googleapis.com/v1/projects/nba-8bb05/databases/(default)/documents/"
        + environment.season + "/today"
        return this.http.get(url).subscribe(
            response => { 
                this.todaySubject.next(response["fields"]["date"]["stringValue"]);
             }
        )
    }

}