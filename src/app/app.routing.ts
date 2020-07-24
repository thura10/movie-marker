import {ModuleWithProviders} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CalendarComponent} from './calendar/calendar.component'
import {CollectionsComponent} from './collections/collections.component'
import {DashboardComponent} from './dashboard/dashboard.component'
import {DiscoverComponent} from './discover/discover.component'
import { AppComponent } from './app.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { TvDetailsComponent } from './tv-details/tv-details.component';

const appRoutes: Routes = [
    {path: 'calendar', component: CalendarComponent},
    {path: 'collections', component: CollectionsComponent},
    {path: 'discover', component: DiscoverComponent},
    {path: 'movie/:id', component: MovieDetailsComponent},
    {path: 'tv/:id', component: TvDetailsComponent},
    {path: '', component: DashboardComponent, pathMatch: 'full'},
]

export const routing:ModuleWithProviders = RouterModule.forRoot(appRoutes, {scrollPositionRestoration: 'enabled'})