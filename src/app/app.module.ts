import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap'

import {routing} from './app.routing'
import {TmdbService} from './tmdb.service'
import {UserService} from './user.service'
import { UiService, SpinnerComponent } from "./ui.service";

import { ReactiveFormsModule } from '@angular/forms';
import {HttpModule} from '@angular/http'
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from "@angular/cdk/overlay";

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CollectionsComponent } from './collections/collections.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DiscoverComponent } from './discover/discover.component';
import { MovieItemComponent } from './movie-item/movie-item.component';
import { TvItemComponent } from './tv-item/tv-item.component';
import { ActorItemComponent } from './actor-item/actor-item.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { TvDetailsComponent } from './tv-details/tv-details.component';
import { CarouselComponent, SafePipe } from './carousel/carousel.component';

@NgModule({
  entryComponents: [
    SpinnerComponent
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    CollectionsComponent,
    CalendarComponent,
    DiscoverComponent,
    MovieItemComponent,
    TvItemComponent,
    ActorItemComponent,
    MovieDetailsComponent,
    SpinnerComponent,
    TvDetailsComponent,
    CarouselComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    routing,
    OverlayModule
  ],
  providers: [TmdbService, UserService, UiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
