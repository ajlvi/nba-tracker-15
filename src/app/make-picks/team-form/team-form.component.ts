import { Component, Input, OnInit } from '@angular/core';
import { SeenDataService } from 'src/app/shared/seen-data.service';
import { TeamData, TeamGameResult } from 'src/app/shared/team.interface';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.css']
})
export class TeamFormComponent implements OnInit {
  @Input() team: string;
  teamdata: TeamData;
  last5: TeamGameResult[] = [];

  constructor(private seen: SeenDataService) {}

  ngOnInit() {
    this.teamdata = this.seen.teamData[this.team]
    this.setup();
  }

  setup() {
    let gameidx = this.teamdata.totg - 1;
    while (this.last5.length < 5 && gameidx >= 0) {
      this.last5.push(this.teamdata[gameidx])
      gameidx--;
    }
  }
}
