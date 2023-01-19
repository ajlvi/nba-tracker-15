import { Component } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { Game } from '../shared/game.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  pickerDate: Date;
  calendarMin = new Date(2022, 9, 18);
  calendarMax = new Date();
  daygames: Game[] = [];

  constructor(private fire: FirestoreService) {}

  onDateSelected() {
    const day: string = ("0" + this.pickerDate.getDate().toString()).slice(-2)
    let month = this.pickerDate.getMonth() + 1;
    if (month < 10) { month = month + 12; }
    const datecode = month.toString() + day;
    this.onFetchDate(datecode);
  }

  onFetchDate(date: string) {
    this.fire.fetchPicksByDate(date).subscribe(
      response => { this.daygames = response; },
      errorMessage => { console.log(errorMessage) }
    )
  }
}
