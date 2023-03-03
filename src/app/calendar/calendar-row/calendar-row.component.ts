import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';
import { SeenDataService } from 'src/app/shared/seen-data.service';
import { TeamData } from 'src/app/shared/team.interface';

@Component({
  selector: 'app-calendar-row',
  templateUrl: './calendar-row.component.html',
  styleUrls: ['./calendar-row.component.css']
})
export class CalendarRowComponent implements OnInit, OnDestroy {
  @Input() team: string;
  @Input() start_date: string;
  end_date: string;
  endSub: Subscription;
  teamdata: TeamData;
  daterange: string[];

  constructor(
    private seen: SeenDataService, 
    private common: CommonService) {}

  ngOnInit() {
    this.teamdata = this.seen.teamData[this.team];
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
