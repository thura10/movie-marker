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

  @Output() changed = new EventEmitter<string>();

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
        this.changed.emit('watched');
      })
      this.isWatched = false;
    }
    else {
      this.userService.addWatchedItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        this.changed.emit('watched');
      })
      this.isWatched = true;
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('movie', this.movie.id).subscribe(res => {
        this.changed.emit('favourite');
      })
      this.isFavourite = false;
    }
    else {
      this.userService.addFavouriteItem('movie', this.movie.id, this.movie.poster_path, this.movie.title).subscribe(res => {
        this.changed.emit('favourite');
      })
      this.isFavourite = true;
    }
  }

  getToken() {
    return this.userService.getToken();
  }
}
