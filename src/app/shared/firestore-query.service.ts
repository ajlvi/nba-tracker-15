import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";

@Injectable({providedIn: 'root'})
export class FirestoreQueryService {
    query_team_documents() {
        return {
          "structuredQuery": {
            "where": {
              "fieldFilter": {
                "field": { "fieldPath": "ats_w" },
                "op": "GREATER_THAN_OR_EQUAL",
                "value": { "integerValue": 0 }
              }
            },
            // "select": {
            //   "fields": []
            // },
            "from": [
              {
                "collectionId": environment.season,
                "allDescendants": true
              }
            ]
          }
        }
    }

    query_player_picks_single(user: string, date: string) {
        return {
          "structuredQuery": {
            "where": {
              "compositeFilter": {
                "op": "AND",
                "filters": [ 
                    { "fieldFilter": {
                        "field": { "fieldPath": "user" },
                        "op": "EQUAL",
                        "value": { "stringValue": user }
                    }} , 
                    { "fieldFilter": {
                        "field": { "fieldPath": "date" },
                        "op": "EQUAL",
                        "value": { "stringValue": date }
                    }},
                    { "fieldFilter": {
                        "field": { "fieldPath": "season" },
                        "op": "EQUAL",
                        "value": { "stringValue": environment.season }
                    }},
                ]
              }
            },
            "from": [
              {
                "collectionId": "picks",
                "allDescendants": true
              }
            ]
          }
        }
    }
}