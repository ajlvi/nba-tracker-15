import { Pipe, PipeTransform } from "@angular/core";
import { Game } from "../shared/game.model";

@Pipe({'name': 'home'})
export class HomePipe implements PipeTransform {
    transform(value: string, gamedata: Game) {
        if (gamedata["home"] === value) {
            return "@" + value;
        }
        else { return value; }
    }
}