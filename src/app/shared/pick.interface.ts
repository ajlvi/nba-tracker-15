export interface SinglePick {
    gameno: number;
    pick: string;
    result?: number;
}

export interface DayPicks {
    doc_id: string;
    date: string;
    user: string;
    0?: SinglePick;
    1?: SinglePick;
    2?: SinglePick;
    3?: SinglePick;
    4?: SinglePick;
    5?: SinglePick;
    6?: SinglePick;
    7?: SinglePick;
    8?: SinglePick;
    9?: SinglePick;
    10?: SinglePick;
    11?: SinglePick;
    12?: SinglePick;
    13?: SinglePick;
    14?: SinglePick;
    15?: SinglePick;
}