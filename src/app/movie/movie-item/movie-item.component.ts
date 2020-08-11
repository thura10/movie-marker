import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['../../common/list-item.component.css']
})
export class MovieItemComponent implements OnChanges {

  @Input() movie: any;
  @Input() small: boolean;

  @Input() watched: any[] = [];
  @Input() favourite: any[] = [];

  isWatched: boolean;
  isFavourite: boolean;

  @Output() changed = new EventEmitter<boolean>();

  addingToCollection: boolean;

  constructor(private userService: UserService) { }
  ngOnChanges() {
    this.isWatched = this.watched.some((item) => {
      return item.id === this.movie.id;
    })
    this.isFavourite = this.favourite.some((item) => {
      return item.id === this.movie.id;
    })
  }

  addFinished() {
    this.addingToCollection = false;
  }

  getPoster(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w500" + poster
    }
    else {
      return "../../../assets/defaultPoster.png"
    }
  }

  addWatched() {
    if (this.isWatched) {
      this.userService.removeWatchedItem('movie', this.movie.id).subscribe(res => {
        if (res.remove){
          this.isWatched = false;
          this.changed.emit(true);    
        }
      })
    }
    else {
      this.userService.addWatchedItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        if (res.add) {
          this.isWatched = true;
          this.changed.emit(true);
        }
      })
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('movie', this.movie.id).subscribe(res => {
        if (res.remove) {
          this.isFavourite = false;
          this.changed.emit(true);    
        }
      })
    }
    else {
      this.userService.addFavouriteItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        if (res.add) {
          this.isFavourite = true;
          this.changed.emit(true);
        }
      })
    }
  }
}
