import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { ScoresComponent } from "./scores/scores.component";
import { MakePicksComponent } from "./make-picks/make-picks.component";
import { PickHistoryComponent } from "./pick-history/pick-history.component";
import { CalendarComponent } from "./calendar/calendar.component";
import { AccountComponent } from "./account/account.component";
import { PasswordUpdateComponent } from "./account/password-update/password-update.component";
import { HandleUpdateComponent } from "./account/handle-update/handle-update.component";
import { GroupsUpdateComponent } from "./account/groups-update/groups-update.component";

const appRoutes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    { path: 'auth', component: AuthComponent },
    { path: 'account', component: AccountComponent, children: [
        { path: 'display-name', component: HandleUpdateComponent },
        { path: 'password-change', component: PasswordUpdateComponent },
        { path: 'groups', component: GroupsUpdateComponent }
    ] },
    { path: 'calendar', component: CalendarComponent },
    { path: 'scores', component: ScoresComponent },
    { path: 'make-picks', component: MakePicksComponent },
    { path: 'pick-history', component: PickHistoryComponent }
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}