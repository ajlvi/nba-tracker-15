import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { CalendarComponent } from "./calendar/calendar.component";
import { MakePicksComponent } from "./make-picks/make-picks.component";
import { PickHistoryComponent } from "./pick-history/pick-history.component";

const appRoutes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    { path: 'auth', component: AuthComponent },
    { path: 'calendar', component: CalendarComponent },
    { path: 'make-picks', component: MakePicksComponent },
    { path: 'pick-history', component: PickHistoryComponent }
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}