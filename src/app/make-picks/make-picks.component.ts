import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Game } from '../shared/game.model';
import { DayPicks } from '../shared/pick.interface';
import { SeenDataService } from '../shared/seen-data.service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-make-picks',
  templateUrl: './make-picks.component.html',
  styleUrls: ['./make-picks.component.css']
})
export class MakePicksComponent implements OnInit, OnDestroy {
  today: Game[]
  todays_date = ''
  error = '';
  message: string = '';
  total: number = 0
  todaySub: Subscription;
  selected = {};
  serverPicks = {};
  possessDate: boolean = false;
  possessGames: boolean = false;
  teamDataReady: boolean = false;

  constructor(
    private todayService: TodayService,
    private seen: SeenDataService,
    private auth: AuthService) {}

  ngOnInit(): void {
    this.todaySub = this.todayService.todaySubject.subscribe(
      response => {
        // response will be null if we subscribe before the date update is done!
        if (response) {
          this.todays_date = response;
          this.possessDate = true;
          this.fetchGameData();
          this.fetchPicksData();
          this.fetchTeamsData();
        }
      }
    )
  }

  fetchTeamsData() {
    if (this.seen.sawTeamData()) {
      this.teamDataReady = true;
    }
    else {
      this.seen.getTeamData().subscribe(
        () => { this.teamDataReady = true; }
      );
    }
  }

  fetchGameData() {
    this.error = '';
    this.possessGames = false;
    if (this.seen.sawDate(this.todays_date)) {
      this.today = this.seen.gamesByDay[this.todays_date]
      this.total = this.today.length;
      this.possessGames = true;
    }
    else {
      this.seen.getGames(this.todays_date).subscribe(
        response => { 
          this.today = response; 
          this.total = this.today.length;
          this.possessGames = true;
        },
        error => {
          this.error = error;
        }
      )
    }
  }

  fetchPicksData() {
    const username = this.auth.currentEmail;
    if (this.seen.sawPicks(username, this.todays_date)) {
      let seenPicks = this.seen.seenPicks[username][this.todays_date]
      for (let gameno in seenPicks) {
        this.serverPicks[gameno] = seenPicks[gameno]["pick"]
        this.toggleSelected(parseInt(gameno), seenPicks[gameno]["pick"])
      }
    }
    else {
      this.seen.getPicks(username, this.todays_date).subscribe(
        response => {
          for (let gameno in response) {
            this.serverPicks[gameno] = response[gameno]["pick"]
            this.toggleSelected(parseInt(gameno), response[gameno]["pick"])
          }         
        }
      )
    }
  }

  isExpired(gameno: number) {
    return new Date().getTime() > this.today[gameno].time;
  }

  ngOnDestroy(): void {
    this.todaySub.unsubscribe();
  }

  onClearSelected() { 
    this.selected = { };
   }

  toggleSelected(gameno: number, team: string) {
    if (this.selected[gameno] && this.selected[gameno] === team) {
      delete this.selected[gameno]
    }
    else {
      this.selected[gameno] = team
    }
  }

  onStorePicks() {
    this.possessDate = false
    this.seen.makePicks(this.todays_date, this.selected).subscribe(
      // makePicks checks for time; we'll use that to determine what's on the server
      (response: DayPicks) => {
        console.log(this.seen.seenPicks);
        for (let i=0; i < this.total ; i++) {
          if (response[i]) { 
            this.serverPicks[i] = response[i].pick;
            if (this.selected[i] !== response[i].pick) {
              this.toggleSelected(i, response[i].pick)
            }
          }
          else { 
              delete this.selected[i];
              delete this.serverPicks[i];
            }
        }
        this.possessDate = true;
      }
    )
  }
}
