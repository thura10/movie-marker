import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { FormControl } from '@angular/forms';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.css']
})
export class DashboardListComponent implements OnInit, OnDestroy {

  sub: any;

  id: string;
  items: any[] = [];

  title: string;
  icon: string;
  errorText: string;

  query: string = "";
  search = new FormControl();

  constructor(private route: ActivatedRoute, private userService: UserService, private ui: UiService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      this.id = params['id'];
      if (this.id === 'foryou') {
        this.title = "For You";
        this.icon = "../../assets/movieItem-favourite.svg";
        this.errorText = "Get personal recommendations by adding favourites";

        this.userService.getForYou().subscribe(res => {
          this.items = res;
          this.ui.stopSpinner();
        })
      }
      else if (this.id === 'nextup') {
        this.title = "Next Up";
        this.icon = "../../assets/tv_icon.png";
        this.errorText = "Add more TV Shows to 'Watched' to start tracking";

        this.userService.getNextUp().subscribe(res => {
          this.items = res;
          this.items.forEach(tv => {
            if (tv.next_episode_to_air) return Object.assign(tv, {calendar: 'next'});
            Object.assign(tv, {calendar: 'last'});
          });
    
          this.ui.stopSpinner();
        })
      }
    })
    this.search.valueChanges.subscribe(res => {
      this.query = res;
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
