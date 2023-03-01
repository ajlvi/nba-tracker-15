import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialExampleModule } from 'src/material.module';
import { AppComponent } from './app.component';
import { ScoresComponent } from './scores/scores.component';
import { HeaderComponent } from './header/header.component';
import { AuthComponent } from './auth/auth.component';
import { AppRoutingModule } from './app-routes.module'
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { MakePicksComponent } from './make-picks/make-picks.component';
import { PickHistoryComponent } from './pick-history/pick-history.component';
import { PickRowComponent } from './pick-history/pick-row/pick-row.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarRowComponent } from './calendar/calendar-row/calendar-row.component';
import { CalendarHeaderComponent } from './calendar/calendar-header/calendar-header.component';
import { TeamFormComponent } from './make-picks/team-form/team-form.component';
import { HomePipe } from './make-picks/home.pipe';
import { TimePipe } from './make-picks/time.pipe';
import { DateExpandPipe } from './shared/date.pipe';
import { TeamFormPipe } from './shared/team-form.pipe';
import { ExcludeUserPipe } from './pick-history/exclude-user.pipe';
import { AccountComponent } from './account/account.component';
import { PasswordUpdateComponent } from './account/password-update/password-update.component';
import { HandleUpdateComponent } from './account/handle-update/handle-update.component';
import { GroupsUpdateComponent } from './account/groups-update/groups-update.component';
import { AddGroupComponent } from './account/groups-update/add-group/add-group.component';
import { GroupConfigComponent } from './account/groups-update/group-config/group-config.component';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    ScoresComponent,
    HeaderComponent,
    AuthComponent,
    MakePicksComponent,
    TimePipe,
    HomePipe,
    DateExpandPipe,
    TeamFormPipe,
    ExcludeUserPipe,
    PickHistoryComponent,
    PickRowComponent,
    CalendarRowComponent,
    CalendarHeaderComponent,
    TeamFormComponent,
    AccountComponent,
    PasswordUpdateComponent,
    HandleUpdateComponent,
    GroupsUpdateComponent,
    AddGroupComponent,
    GroupConfigComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
//    NoopAnimationsModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
