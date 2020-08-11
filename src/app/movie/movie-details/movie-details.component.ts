import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { TmdbService } from '../../tmdb.service';
import { UiService } from "../../ui.service";
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['../../common/item-details.component.css']
})
export class MovieDetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  movie: any;
  collection: any;

  watched: any[] = [];
  favourite: any[] = [];

  isWatched: boolean;
  isFavourite: boolean;

  constructor(private route: ActivatedRoute, private tmdb: TmdbService, private ui: UiService, private userService: UserService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      let id = params['id'];
      this.tmdb.getMovieDetails(id).subscribe(result => {
        this.movie = result;
        this.dataChanged('');
        if (this.movie.belongs_to_collection) {
          this.tmdb.getCollection(this.movie.belongs_to_collection.id).subscribe(result => {
            this.collection = result;
          })
        }
        this.ui.stopSpinner();
      })
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getPoster(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w500" + poster
    }
    else {
      return "../../../assets/defaultPoster.png"
    }
  }
  getBackdrop(backdrop: string) {
    if (backdrop) {
      return "https://image.tmdb.org/t/p/w1280" + backdrop
    }
    else {
      return "../../../assets/dashboardBg.png"
    }
  }
  getInfo(info: any[]) {
    let str: string = "";
    for (let i=0; i< info.length; i++) {
      if (info[i].name) {
        str += info[i].name + " • "
      }
      if (i== info.length -1) {
        str= str.slice(0,-3)
      }
    }
    return str
  }
  getDirectors(crews: any[]) {
    if (!crews) return [];
    let directors = crews.filter(crew => {
      return crew.job === "Director"
    })
    return directors
  }

  dataChanged(event) {
    switch (event) {
      case 'watched':
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
          this.isWatched = this.watched.some((item) => {
            return item.id === this.movie.id;
          })
        })
        break;
      case 'favourite':
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
          this.isFavourite = this.favourite.some((item) => {
            return item.id === this.movie.id;
          })
        });
        break;
      default:
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
          this.isWatched = this.watched.some((item) => {
            return item.id === this.movie.id;
          })
        });
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
          this.isFavourite = this.favourite.some((item) => {
            return item.id === this.movie.id;
          })
        });
    }
  }
  addWatched() {
    if (this.isWatched) {
      this.userService.removeWatchedItem('movie', this.movie.id).subscribe(res => {
        this.dataChanged('watched');  
      })
      this.isWatched = false;
    }
    else {
      this.userService.addWatchedItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        this.dataChanged('watched');
      })
      this.isWatched = true;
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('movie', this.movie.id).subscribe(res => {
        this.dataChanged('favourite');
      })
      this.isFavourite = false;
    }
    else {
      this.userService.addFavouriteItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        this.dataChanged('favourite');
      })
      this.isFavourite = true;
    }
  }

  addingToCollection: boolean;
  addFinished() {
    this.addingToCollection = false;
  }

}
