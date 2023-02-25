import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Game } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.css']
})
export class ScoresComponent implements OnInit{
  pickerDate: Date;
  calendarMin = new Date(2022, 9, 18);
  calendarMax = new Date();
  daygames: Game[] = [];

  constructor(private seen: SeenDataService, private today: TodayService) {}

  ngOnInit(): void {
    this.today.todaySubject.subscribe(
      response => {
        if (response) {
          const startYear = 2000 + parseInt(environment.season.slice(1, 3));
          const seasonStartMonth = (parseInt(environment.season_start.slice(0, 2)) - 1) % 12;
          const seasonStartDay = parseInt(environment.season_start.slice(2));
          const currentMonth = parseInt(response.slice(0, 2)) - 1
          const currentDay = parseInt(response.slice(2));
          let currentYear = startYear;
          if (currentMonth >= 12) {currentYear++;}
          this.calendarMin = new Date(startYear, seasonStartMonth, seasonStartDay);
          this.calendarMax = new Date(currentYear, currentMonth%12, currentDay)          
        }
      }
    )
  }

  onDateSelected() {
    const day: string = ("0" + this.pickerDate.getDate().toString()).slice(-2)
    let month = this.pickerDate.getMonth() + 1;
    if (month < 10) { month = month + 12; }
    const datecode = month.toString() + day;
    this.onFetchDate(datecode);
  }

  //we should store these as we load them?
  onFetchDate(date: string) {
    if (this.seen.sawDate(date)) {
      this.daygames = this.seen.gamesByDay[date];
    }
    else {
      this.seen.getGames(date).subscribe(
        response => { this.daygames = response; }
      )
    }
  }
}
