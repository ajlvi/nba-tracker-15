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
import { DateExpandPipe } from './make-picks/date.pipe';
import { TeamFormPipe } from './shared/team-form.pipe';

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
    PickHistoryComponent,
    PickRowComponent,
    CalendarRowComponent,
    CalendarHeaderComponent,
    TeamFormComponent
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
