import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

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

  query_group_membership(groupname: string) {
    return {
      "structuredQuery": {
        "where": {
          "fieldFilter": {
            "field": { "fieldPath": "groups" },
            "op": "ARRAY_CONTAINS",
            "value": { "stringValue": groupname }
          }
        },
        "from": [
          {
            "collectionId": "users",
            "allDescendants": true
          }
        ]
      }
    }
  }

  query_player_picks_multiple(users: string[], start_date: string, end_date: string) {
    let usersArray = {"values": [] };
    for (let user of users) { usersArray["values"].push({"stringValue": user}) }
    return {
      "structuredQuery": {
        "where": {
          "compositeFilter": {
            "op": "AND",
            "filters": [ 
                { "fieldFilter": {
                    "field": { "fieldPath": "user" },
                    "op": "IN",
                    "value": { "arrayValue": usersArray }
                }} , 
                { "fieldFilter": {
                    "field": { "fieldPath": "date" },
                    "op": "GREATER_THAN_OR_EQUAL",
                    "value": { "stringValue": start_date }
                }},
                { "fieldFilter": {
                    "field": { "fieldPath": "date" },
                    "op": "LESS_THAN_OR_EQUAL",
                    "value": { "stringValue": end_date }
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