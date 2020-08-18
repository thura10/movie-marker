import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/ui.service';
import { UserService } from 'src/app/user.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.css']
})
export class CollectionDetailsComponent implements OnInit, OnDestroy {
  
  private sub: any;
  collection: any;
  special: boolean;

  movieCount: number;
  tvCount: number;

  list: any[] = [];

  search = new FormControl();
  query: string = "";

  constructor(private route: ActivatedRoute, private ui: UiService, private userService: UserService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      let id = params['id'];
      switch(id) {
        case 'favourite':
          this.userService.getFavourite().subscribe(res => {
            this.list = res;
            this.collection = {name: 'Favourites'};

            this.getCount();
            this.ui.stopSpinner();
          })
          this.special = true;
          break;

        case 'watched':
          this.userService.getWatched().subscribe(res => {
            this.list = res;
            this.collection = {name: 'Watched'};

            this.getCount();
            this.ui.stopSpinner();
          })
          this.special = true;
          break;

        default:
          this.userService.getCollection(id).subscribe(result => {
            this.collection = result;
            this.list = result.items;
            
            this.getCount();
            this.ui.stopSpinner();
          })
          break;
      }
    })

    this.search.valueChanges.subscribe(res => {
      this.query = res;
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getCount() {
    this.movieCount = this.list.filter((item) => item.type === 'movie').length;
    this.tvCount = this.list.filter((item) => item.type === 'tv').length;
  }

  collectionEdit: boolean;
  collectionEditId: string;
  collectionEditMode: string;
  collectionEditName: string;

  share() {
    this.collectionEdit = true;
    this.collectionEditId = this.collection._id;

    this.collectionEditMode = 'share'
  }
  edit() {
    this.collectionEdit = true;
    this.collectionEditId = this.collection._id;

    this.collectionEditMode = 'edit';
    this.collectionEditName = this.collection.name;
  }
  delete() {
    this.collectionEdit = true;
    this.collectionEditId = this.collection._id;

    this.collectionEditMode = 'delete';
    this.collectionEditName = this.collection.name;
  }

  editDone(edit) {
    if (edit == 'done') {
      this.collectionEdit = false;
      this.ngOnInit();
    }
  }

}
