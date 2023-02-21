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
import { AuthGuard } from "./auth/auth.guard";

const appRoutes: Routes = [
    { 
        path: '',
        redirectTo: '/make-picks', 
        pathMatch: 'full' 
    },
    { 
        path: 'auth', 
        component: AuthComponent 
    },
    { 
        path: 'account', 
        component: AccountComponent, 
        canActivate: [AuthGuard],
        children: [
            { path: 'display-name', component: HandleUpdateComponent },
            { path: 'password-change', component: PasswordUpdateComponent },
            { path: 'groups', component: GroupsUpdateComponent }
        ] 
    },
    { 
        path: 'calendar', 
        canActivate: [AuthGuard], 
        component: CalendarComponent 
    },
    { 
        path: 'scores', 
        canActivate: [AuthGuard],
        component: ScoresComponent 
    },
    { 
        path: 'make-picks', 
        canActivate: [AuthGuard],
        component: MakePicksComponent 
    },
    { 
        path: 'pick-history', 
        canActivate: [AuthGuard],
        component: PickHistoryComponent 
    }
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}