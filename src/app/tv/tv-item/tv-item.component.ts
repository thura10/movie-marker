import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tv-item',
  templateUrl: './tv-item.component.html',
  styleUrls: ['../../common/list-item.component.css']
})
export class TvItemComponent implements OnChanges {

  @Input() tv: any;
  addingToCollection: boolean;

  @Input() calendar: string;

  constructor(private userService: UserService, private router: Router) { }

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

  @Output() changed = new EventEmitter<string>();

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
          this.changed.emit('watched');
      })
      this.isWatched = false;
    }
    else {
      this.userService.addWatchedItem('tv', this.tv.id, this.tv.poster_path, this.tv.name).subscribe(res => {
          this.changed.emit('watched');
      })
      this.isWatched = true;
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('tv', this.tv.id).subscribe(res => {
          this.changed.emit('favourite');
      })
      this.isFavourite = false;
    }
    else {
      this.userService.addFavouriteItem('tv', this.tv.id, this.tv.poster_path, this.tv.name).subscribe(res => {
        this.changed.emit('favourite');
      })
      this.isFavourite = true;
    }
  }

  navigate() {
    if (this.calendar == 'next') {
      this.router.navigate(['/tv', this.tv.id, this.tv.name, this.tv.next_episode_to_air.season_number, this.tv.next_episode_to_air.episode_number])
    }
    else if (this.calendar == 'last') {
      this.router.navigate(['/tv', this.tv.id, this.tv.name, this.tv.last_episode_to_air.season_number, this.tv.last_episode_to_air.episode_number])
    }
  }

  getToken() {
    return this.userService.getToken();
  }
}
