import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonService } from '../shared/common.service';
import { SeenDataService } from '../shared/seen-data.service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  divisions: string[][] = [];
  todays_date: string = '';

  constructor(
    private seen: SeenDataService,
    private common: CommonService,
    private today: TodayService
  ) {}

  ngOnInit(): void {
    if (this.seen.sawTeamData()) {
      this.setDivisions();
    } else {
      this.seen.getTeamData().subscribe(() => {
        this.setDivisions();
      });
    }
    this.today.todaySubject.subscribe((date) => {
      if (date) {
        this.todays_date = date;
        this.onSetEnd(1);
      }
    });
  }

  setDivisions() {
    const totalTeams = Object.keys(this.seen.teamData).length;
    if (totalTeams === 30) {
      this.divisions = [
        ['PHI', 'NY', 'BOS', 'BKN', 'TOR'],
        ['CHI', 'DET', 'IND', 'CLE', 'MIL'],
        ['MIA', 'ATL', 'ORL', 'CHA', 'WSH'],
        ['DEN', 'UTAH', 'OKC', 'POR', 'MIN'],
        ['LAL', 'LAC', 'PHX', 'SAC', 'GS'],
        ['SA', 'DAL', 'HOU', 'MEM', 'NO'],
      ];
    } else {
      const east = [
        'ATL', 'BKN', 'BOS', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 
        'MIA', 'MIL', 'NY', 'ORL', 'PHI', 'TOR', 'WSH'
      ];
      const west = [
        'DAL', 'DEN', 'GS', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN',
        'NO', 'OKC', 'PHX', 'POR', 'SA', 'SAC', 'UTAH'
      ];
      let divisions = [[], []];
      for (let team of east) {
        if (team in this.seen.teamData) { divisions[0].push(team) }
      }
      for (let team of west) {
        if (team in this.seen.teamData) { divisions[1].push(team)}
      }
      this.divisions = divisions;
    }
  }

  onSetEnd(option: number): void {
    if (option === 1) {
      let day = this.todays_date;
      for (let j = 0; j <= 30; j++) {
        day = this.common.previous_day(day);
      }
      this.common.calendarEndDateSub.next(day);
    } else {
      this.common.calendarEndDateSub.next(environment.season_start);
    }
  }
}
