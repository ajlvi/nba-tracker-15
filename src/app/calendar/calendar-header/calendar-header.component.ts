import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.css']
})
export class CalendarHeaderComponent implements OnInit, OnDestroy {
  @Input() start_date: string;
  end_date: string;
  endSub: Subscription;
  daterange: string[];

  constructor(
    private common: CommonService) {}

  ngOnInit() {
    this.endSub = this.common.calendarEndDateSub.subscribe(
      (date: string) => {
        if (date) {
          this.end_date = date;
          this.setDateRange();
        }
      }
    )
    this.setDateRange();
  }

  ngOnDestroy(): void {
    this.endSub.unsubscribe;
  }

  setDateRange() {
    let dates = [];
    let date = this.start_date
    while (date !== this.end_date) {
      dates.push(date);
      date = this.common.previous_day(date);
    }
    this.daterange = dates;
  }
}
