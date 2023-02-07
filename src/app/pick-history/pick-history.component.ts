import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { RecordData } from '../shared/game.model';
import { SeenDataService } from '../shared/seen-data-service';

@Component({
  selector: 'app-pick-history',
  templateUrl: './pick-history.component.html',
  styleUrls: ['./pick-history.component.css']
})
export class PickHistoryComponent implements OnInit {
  recordData: RecordData;
//  yesterday: {[gameId: number]: Pick } = {};
  
  constructor(private fire: FirestoreService, private seen: SeenDataService) {}

  ngOnInit(): void {
    // this.fire.getUserStats().subscribe(
    //   (response: RecordData) => { this.recordData = response; }
    // )


    // if (this.seen.sawPicks("1403")) {
    //   this.yesterday = this.seen.userPicks["1403"];
    // }
    // else {
    //   this.seen.getPicks("1403").subscribe(
    //     response => {this.yesterday = response;}
    //   )
    // }

    // this.fire.single_date_picks().subscribe(
    //   response => {console.log(response)}
    // );
  }
}
