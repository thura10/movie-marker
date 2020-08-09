import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiService } from '../ui.service';
import { UserService } from '../user.service';
import { TmdbService } from '../tmdb.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private ui: UiService, private userService: UserService, private tmdb: TmdbService) { }

  private sub: any;

  collection: any;

  list: any[];
  page: number = 1;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      let id = params['id'];
      let type = params['type'];

      if (type === 'collection') {
        this.userService.getCollection(id).subscribe(result => {
          this.collection = result;
          this.list = result.items;
          this.ui.stopSpinner();
        })
      }
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
