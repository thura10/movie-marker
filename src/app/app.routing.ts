import {ModuleWithProviders} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CalendarComponent} from './calendar/calendar.component'
import {CollectionsComponent} from './collections/collections.component'
import {DashboardComponent} from './dashboard/dashboard.component'
import {DiscoverComponent} from './discover/discover.component'
import { AppComponent } from './app.component';
import { MovieDetailsComponent } from './movie/movie-details/movie-details.component';
import { TvDetailsComponent } from './tv/tv-details/tv-details.component';
import { ListComponent } from './common/list/list.component';
import { CollectionDetailsComponent } from './collections/collection-details/collection-details.component';
import { ActorDetailsComponent } from './actor/actor-details/actor-details.component';
import { GenreComponent } from './common/genre/genre.component';

const appRoutes: Routes = [
    {path: 'calendar', component: CalendarComponent},
    {path: 'collections', component: CollectionsComponent},
    {path: 'discover', component: DiscoverComponent},
    {path: 'movie/:id', component: MovieDetailsComponent},
    {path: 'tv/:id', component: TvDetailsComponent},
    {path: 'collections/:id', component: CollectionDetailsComponent},
    {path: 'actor/:id', component: ActorDetailsComponent},
    {path: 'genre/:type/:id', component: GenreComponent},
    {path: '', component: DashboardComponent, pathMatch: 'full'},
]

export const routing:ModuleWithProviders = RouterModule.forRoot(appRoutes, {scrollPositionRestoration: 'enabled'})