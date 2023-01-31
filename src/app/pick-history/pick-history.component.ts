import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { RecordData } from '../shared/game.model';

@Component({
  selector: 'app-pick-history',
  templateUrl: './pick-history.component.html',
  styleUrls: ['./pick-history.component.css']
})
export class PickHistoryComponent implements OnInit {
  constructor(private fire: FirestoreService) {}
  recordData: RecordData;
  
  ngOnInit(): void {
    this.fire.getUserStats().subscribe(
      (response: RecordData) => { this.recordData = response; }
    )
  }
}
