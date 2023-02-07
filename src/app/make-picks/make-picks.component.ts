import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Game } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';
import { TodayService } from '../shared/today.service';

@Component({
  selector: 'app-make-picks',
  templateUrl: './make-picks.component.html',
  styleUrls: ['./make-picks.component.css']
})
export class MakePicksComponent implements OnInit, OnDestroy {
  today: Game[]
  todays_date = ''
  total: number = 0
  todaySub: Subscription;
  selected = {};
  serverPicks = {};
  isCommunicating = false;

  constructor(
    private todayService: TodayService,
    private seen: SeenDataService) {}

  ngOnInit(): void {
    this.isCommunicating = true;
    this.todaySub = this.todayService.todaySubject.subscribe(
      response => {
        // response will be null if we subscribe before the date update is done!
        if (response) {
          this.todays_date = response;
          this.fetchGameData();
          this.fetchPicksData();
          this.isCommunicating = false;
        }
      }
    )
  }

  fetchGameData() {
    if (this.seen.sawDate(this.todays_date)) {
      this.today = this.seen.gamesByDay[this.todays_date]
      this.total = this.today.length;
    }
    else {
      this.seen.getGames(this.todays_date).subscribe(
        response => { 
          this.today = response; 
          this.total= this.today.length;
        }
      )
    }
  }

  fetchPicksData() {
    if (this.seen.sawPicks(this.todays_date)) {
      let seenPicks = this.seen.userPicks[this.todays_date]
      for (let gameno in seenPicks) {
        this.serverPicks[gameno] = seenPicks[gameno]["pick"]
      }
    }
    else {
      this.seen.getPicks(this.todays_date).subscribe(
        response => {
          for (let gameno in response) {
            this.serverPicks[gameno] = response[gameno]["pick"]
          }         
        }
      )
    }
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
    this.isCommunicating = true
    this.seen.makePicks(this.todays_date, this.selected).subscribe(
      //I don't care about the response, I just need to know the operation finished.
      () => {
        for (let i=0; i < this.total ; i++) {
          if (this.selected[i]) { this.serverPicks[i] = this.selected[i]; }
          else { delete this.serverPicks[i] }
        }
        this.isCommunicating = false;
      }
    )
  }
}
