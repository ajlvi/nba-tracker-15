import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { CommonService } from '../shared/common.service';
import { RecordData } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-pick-history',
  templateUrl: './pick-history.component.html',
  styleUrls: ['./pick-history.component.css']
})
export class PickHistoryComponent implements OnInit {
  pickerDate: Date;
  calendarMin: Date;
  calendarMax: Date;
 
  //logged-in user's data
  username: string = ''

  //others' data
  activeGroup: string = '';
  groups: string[] = [];
  roster: string[] = [];
  groupData: {[user: string] : {"handle": string, "seasonRecord": RecordData, "visibleRecord": RecordData}} = {};
 
  dates: string[] = [];
  isLoading: boolean = true;
  
  constructor(
    private seen: SeenDataService,
    private today: TodayService,
    private common: CommonService,
    private auth: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.username = this.auth.currentEmail;
    this.roster = [this.username]

    if ( this.seen.sawRecord(this.username) ) {
      this.initialDataGathering()
    }
    else {
      this.seen.getUserData(this.username).subscribe(
        () => { this.initialDataGathering(); }
      )
    }

    this.today.todaySubject.subscribe(
      todays_date => {
        if (todays_date) {
          const startYear = 2000 + parseInt(environment.season.slice(1, 3));
          const seasonStartMonth = (parseInt(environment.season_start.slice(0, 2)) - 1) % 12;
          const seasonStartDay = parseInt(environment.season_start.slice(2));
          const currentMonth = parseInt(todays_date.slice(0, 2)) - 1
          const currentDay = parseInt(todays_date.slice(2));
          let currentYear = startYear;
          if (currentMonth >= 12) {currentYear++;}
          this.calendarMin = new Date(startYear, seasonStartMonth, seasonStartDay);
          this.calendarMax = new Date(currentYear, currentMonth%12, currentDay);
          this.pickerDate = this.calendarMax;      
          this.getGroupmateData(todays_date)
        }
      }
    )
  }

  initialDataGathering() {
    // not run until user document has been received
    this.groups = this.seen.UserData[this.username]["groups"]; 
    this.groupData[this.username] = 
      {
        "handle": this.seen.UserData[this.username].handle, 
        "seasonRecord": this.seen.recordData[this.username], 
        "visibleRecord": new RecordData(this.username, -1, -1, -1)
      }
  }

  onGroupSelected(group: string) {
    //if we're picking a group then we're in a loaded state, so this.dates is reversed!
    this.activeGroup = group;
    if (this.seen.sawGroup(group)) {
      this.getGroupmateData(this.dates[0])  
    }
    else {
      this.seen.getGroupRoster(group).subscribe(
        () => { this.getGroupmateData(this.dates[0]) }
      )
    }
  }

  getGroupmateData(enddate: string) {
    let daterange = this.dateRange(enddate); //note daterange is ascending
    // if this.activeGroup is undefined, then this.roster = [this.username].
    if (this.activeGroup) { this.roster = this.seen.GroupRosters[this.activeGroup] }
    // the roster collection already done will also have set season-record and handle data, 
    // but we probably need picks.
    let needsPicks = [];
    for (let user of this.roster) {
      let sawPicks = true;
      for (let date of daterange) {
        if (! this.seen.sawPicks(user, date)) { sawPicks = false; }
      }
      if (!sawPicks) { needsPicks.push(user) }
    }
    if (needsPicks.length > 0 ) {
      this.isLoading = true;
      this.seen.getMultiplePicks(needsPicks, daterange).subscribe(
        () => { this.processGroupPicks(daterange); }
      )
    }
    else {
      this.processGroupPicks(daterange)
    }
  }

  processGroupPicks(daterange: string[]) {
    for (let user of this.roster) {
      const handle = this.seen.UserData[user].handle;
      const seasonRec = this.seen.recordData[user];
      const visibleRec = this.seen.recordOverRange(user, daterange);
      this.groupData[user] = {"handle": handle, "seasonRecord": seasonRec, "visibleRecord": visibleRec}
    }
    this.isLoading = false;
    this.dates = daterange.reverse();
  }

  onDateSelected() {
    this.dates = []
    let adjMonth = this.pickerDate.getMonth() >= 10? this.pickerDate.getMonth() : this.pickerDate.getMonth() + 12
    const month = ("0" + (adjMonth+1).toString()).slice(-2)
    const day = ("0" + this.pickerDate.getDate().toString()).slice(-2)
    this.getGroupmateData(month+day);
  }

  dateRange(end_date: string) {
    let current = end_date;
    let dates = [end_date]
    while ( dates.length < 7 && current >= environment.season_start ) {
      let prev = this.common.previous_day(current);
      dates.unshift(prev);
      current = prev;
    }
    return dates
  }

  needsPicks(username: string, daterange: string[]) {
    for (let date of daterange) {
      if (!this.seen.sawPicks(username, date)) { return true; }
    }
    return false;
  }
}
