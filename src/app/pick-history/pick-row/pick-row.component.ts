import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common.service';
import { RecordData } from 'src/app/shared/game.model';
import { DayPicks } from 'src/app/shared/pick.interface';
import { SeenDataService } from 'src/app/shared/seen-data.service';

@Component({
  selector: 'app-pick-row',
  templateUrl: './pick-row.component.html',
  styleUrls: ['./pick-row.component.css']
})
export class PickRowComponent implements OnInit {
  @Input() date: string;
  @Input() user: string;
  picks: DayPicks;
  cell_indices: number[] = []
  record: RecordData;

  constructor(private seen: SeenDataService, private common: CommonService) {}

  ngOnInit() {
    this.picks = this.seen.seenPicks[this.user][this.date];
    this.process_picks()
  }

  process_picks() {
    this.record = this.common.record_on_day(this.picks)
    let picked_games = []
    for (let i = 0; i <= 15; i++) {
      if (this.picks[i]) {picked_games.push(i)}
    }

    if (picked_games.length > 0) {
      this.cell_indices = new Array(1 + picked_games[picked_games.length-1]).fill(0)
    }
  }
}
