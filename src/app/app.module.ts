import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbCarouselModule, NgbPaginationModule, NgbModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap'

import {routing} from './app.routing'
import {TmdbService} from './tmdb.service'
import {UserService} from './user.service'
import { UiService, SpinnerComponent } from "./ui.service";

import { ReactiveFormsModule } from '@angular/forms';
import {HttpModule} from '@angular/http'
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from "@angular/cdk/overlay";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CollectionsComponent } from './collections/collections.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DiscoverComponent } from './discover/discover.component';
import { MovieItemComponent } from './movie/movie-item/movie-item.component';
import { TvItemComponent } from './tv/tv-item/tv-item.component';
import { ActorItemComponent } from './actor/actor-item/actor-item.component';
import { MovieDetailsComponent } from './movie/movie-details/movie-details.component';
import { TvDetailsComponent, ScrollToDirective } from './tv/tv-details/tv-details.component';
import { CarouselComponent, SafePipe } from './common/carousel/carousel.component';
import { CollectionItemComponent } from './collections/collection-item/collection-item.component';
import { CollectionEditComponent } from './collections/collection-edit/collection-edit.component';
import { CollectionAddComponent } from './collections/collection-add/collection-add.component';
import { ListComponent } from './common/list/list.component';
import { CollectionDetailsComponent } from './collections/collection-details/collection-details.component';
import { ActorDetailsComponent } from './actor/actor-details/actor-details.component';
import { GenreComponent } from './common/genre/genre.component';
import { LazyListComponent } from './common/lazy-list/lazy-list.component';
import { DiscoverListComponent } from './discover/discover-list/discover-list.component';
import { AdminComponent } from './admin/admin.component';
import { EpisodeDetailsComponent } from './tv/episode-details/episode-details.component';
import { DashboardListComponent } from './dashboard/dashboard-list/dashboard-list.component';

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
    SafePipe,
    ScrollToDirective,
    CollectionItemComponent,
    CollectionEditComponent,
    CollectionAddComponent,
    ListComponent,
    CollectionDetailsComponent,
    ActorDetailsComponent,
    GenreComponent,
    LazyListComponent,
    DiscoverListComponent,
    AdminComponent,
    EpisodeDetailsComponent,
    DashboardListComponent,
  ],
  imports: [
    BrowserModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbAlertModule,
    NgbModalModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    HttpModule,
    HttpClientModule,
    routing,
    OverlayModule,
    BrowserAnimationsModule,
  ],
  providers: [TmdbService, UserService, UiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
