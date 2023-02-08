import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { RecordData } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-pick-history',
  templateUrl: './pick-history.component.html',
  styleUrls: ['./pick-history.component.css']
})
export class PickHistoryComponent implements OnInit {
  seasonRecordData: RecordData;
  visibleRecordData: RecordData;
  dates: string[] = [];
  username: string = ''
  
  constructor(
    private seen: SeenDataService,
    private today: TodayService,
    private auth: AuthService) {}

  ngOnInit(): void {
    this.username = this.auth.currentEmail;

    if ( this.seen.sawRecord(this.username) ) {
      this.seasonRecordData = this.seen.recordData[this.username]
    }
    else {
      this.seen.getUserStats().subscribe(
        (response: RecordData) => { this.seasonRecordData = response; }
      )
    }

    this.today.todaySubject.subscribe(
      todays_date => {
        if (todays_date) {
          let daterange = this.dateRange(todays_date);
          if (this.needsPicks(this.username, daterange)) {
            this.seen.getMultiplePicks(this.username, daterange).subscribe(
              () => {
                daterange.reverse(); 
                this.dates = daterange;
                this.visibleRecordData = this.seen.recordOverRange(this.username, daterange);
              }
            )
          }
          else {
            daterange.reverse();
            this.dates = daterange ;
            this.visibleRecordData = this.seen.recordOverRange(this.username, daterange);
          }
        }
      }
    )
  }

  //NEEDS TO BE IMPROVED TO KNOW START AND END OF SEASON ajlvi
  dateRange(end_date: string) {
    let current = end_date;
    let dates = [end_date]
    while ( dates.length < 7 ) {
      let prev = this.previous_day(current);
      dates.unshift(prev);
      current = prev;
    }
    return dates
  }

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
        default: console.log(date); return "xxxx";
      }
    }
  }

  needsPicks(username: string, daterange: string[]) {
    for (let date of daterange) {
      if (!this.seen.sawPicks(username, date)) { return true; }
    }
    return false;
  }
}
