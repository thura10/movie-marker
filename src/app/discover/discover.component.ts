import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../tmdb.service';
import { UserService } from '../user.service';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {

  constructor(private userService: UserService, private tmdb: TmdbService, private ui: UiService) { }

  trendingMovies: any[];
  trendingTv: any[];

  popularMovies: any[];
  popularTv: any[];

  ngOnInit() {
    this.dataChanged('');
    this.tmdb.getTrendingMovies().subscribe(res => {
      this.trendingMovies = res.results;
    })
    this.tmdb.getTrendingTv().subscribe(res => {
      this.trendingTv = res.results;
    })
    this.tmdb.getPopularMovies().subscribe(res => {
      this.popularMovies = res.results;
    })
    this.tmdb.getPopularTv().subscribe(res => {
      this.popularTv = res.results;
    })
  }

  watched: any[] = [];
  favourite: any[] = [];

  dataChanged(event) {
    if (!this.userService.getToken()) return;
    switch (event) {
      case 'watched':
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
        })
        break;
      case 'favourite':
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
        });
        break;
      default:
        this.dataChanged('watched');
        this.dataChanged('favourite');
    }
  }

}
