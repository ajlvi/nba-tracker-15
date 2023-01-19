export class Game {
    fav: string;
    line: string;
    dog: string;
    score: string;
    home: string; 
    ats_win: string;

    constructor(
        fav: string, 
        line: string, 
        dog: string, 
        score: string, 
        home: string, 
        ats_win: string
    ) {
        this.fav = fav;
        this.line = line;
        this.dog = dog;
        this.score = score;
        this.home = home;
        this.ats_win = ats_win;
    }
}