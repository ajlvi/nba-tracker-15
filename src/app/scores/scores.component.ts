import { Component } from '@angular/core';
import { Game } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.css']
})
export class ScoresComponent {
  pickerDate: Date;
  calendarMin = new Date(2022, 9, 18);
  calendarMax = new Date();
  daygames: Game[] = [];

  constructor(private seen: SeenDataService) {}

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
