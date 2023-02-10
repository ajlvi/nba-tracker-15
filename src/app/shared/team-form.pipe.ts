import { Pipe, PipeTransform } from "@angular/core";
import { TeamGameResult } from "src/app/shared/team.interface";

@Pipe({'name': 'teamform'})
export class TeamFormPipe implements PipeTransform {
    transform(value: TeamGameResult, team: string, includeDate: boolean): string {
        let output = "";
        let month = parseInt(value.date.slice(0, 2));
        let day = parseInt(value.date.slice(2))
        if (month >= 13) {month = month - 12;}
        if (includeDate) {
            output = output + month.toString() + "/" + day.toString() + ": ";
        }
        if (value.score.slice(0, team.length) === team) {
            output = output + "(" + value.line + ") " + value.score;
        }
        else {
            output = output + value.score + " (" + value.line + ")";
        }
        return output
    }
}