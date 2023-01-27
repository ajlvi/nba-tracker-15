import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { Game } from '../shared/game.model';

@Component({
  selector: 'app-make-picks',
  templateUrl: './make-picks.component.html',
  styleUrls: ['./make-picks.component.css']
})
export class MakePicksComponent implements OnInit{
  today: Game[]
  todays_date = ''
  selected = {};
  serverPicks = {};
  isCommunicating = false;
  constructor(private fire: FirestoreService) {}

  ngOnInit(): void {
    this.isCommunicating = true;
    this.todays_date = "1326"; //this will have to be more sophisticated
    this.fire.fetchPicksByDate(this.todays_date).subscribe(
      response => { 
        this.today = response;
        this.selected["total"] = this.today.length;
      },
      errorMessage => { console.log(errorMessage) }
    )
    this.fire.fetchUserPicks(this.todays_date).subscribe(
      response => {
        this.serverPicks = response;
      }
    )
    this.isCommunicating = false;
  }

  onClearSelected() { 
    this.selected = { "total": this.today.length };
   }

  toggleSelected(gameno: number, team: string) {
    if (this.selected[gameno] && this.selected[gameno] === team) {
      delete this.selected[gameno]
    }
    else {
      this.selected[gameno] = team
    }
    console.log(this.selected)
  }

  onStorePicks() {
    this.isCommunicating = true
    this.fire.make_picks(this.selected, this.todays_date).subscribe(
      response => {
        for (let i=0; i<this.selected["total"]; i++) {
          if (this.selected[i]) { this.serverPicks[i] = this.selected[i]; }
          else { delete this.serverPicks[i] }
        }
        this.isCommunicating = false;
      }
    )
  }
}
