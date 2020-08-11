import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-tv-item',
  templateUrl: './tv-item.component.html',
  styleUrls: ['../../common/list-item.component.css']
})
export class TvItemComponent implements OnChanges {

  @Input() tv: any;
  addingToCollection: boolean;

  constructor(private userService: UserService) { }

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

  @Input() watched: any[] = [];
  @Input() favourite: any[] = [];
  isWatched: boolean;
  isFavourite: boolean;

  @Output() changed = new EventEmitter<boolean>();

  ngOnChanges() {
    this.isWatched = this.watched.some((item) => {
      return item.id === this.tv.id;
    })
    this.isFavourite = this.favourite.some((item) => {
      return item.id === this.tv.id;
    })
  }

  addWatched() {
    if (this.isWatched) {
      this.userService.removeWatchedItem('tv', this.tv.id).subscribe(res => {
        if (res.remove){
          this.isWatched = false;
          this.changed.emit(true);    
        }
      })
    }
    else {
      this.userService.addWatchedItem('tv', this.tv.id, this.tv.poster_path, this.tv.title).subscribe(res => {
        if (res.add) {
          this.isWatched = true;
          this.changed.emit(true);
        }
      })
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('tv', this.tv.id).subscribe(res => {
        if (res.remove) {
          this.isFavourite = false;
          this.changed.emit(true);    
        }
      })
    }
    else {
      this.userService.addFavouriteItem('tv', this.tv.id, this.tv.poster_path, this.tv.name).subscribe(res => {
        if (res.add) {
          this.isFavourite = true;
          this.changed.emit(true);
        }
      })
    }
  }
}
