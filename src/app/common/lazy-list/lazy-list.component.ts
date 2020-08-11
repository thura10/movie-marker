import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { trigger, transition, style, animate, stagger, animateChild, query } from '@angular/animations';
import { UiService } from 'src/app/ui.service';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-lazy-list',
  templateUrl: './lazy-list.component.html',
  styleUrls: ['./lazy-list.component.css'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('.3s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*' }),
        animate('.8s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
         style({
           transform: 'scale(0.5)', opacity: 0, 
           height: '0px', margin: '0px' 
         })) 
      ])
    ]),
    trigger('list', [
      transition(':enter', [
        query('@items', stagger(85, animateChild()))
      ]),
    ])
  ],
})
export class LazyListComponent implements OnInit, OnChanges {

  constructor(private ui: UiService, private userService: UserService) { }

  @Input() list: any[] = [];
  @Input() query: string = '';
  @Input() collectionSize: number;

  @Output() pageChanged = new EventEmitter<number>();

  page: number = 1;

  watched: any[] = [];
  favourite: any[] = [];

  ngOnInit() {
    this.dataChanged('');
  }
  ngOnChanges() {
    this.ui.stopSpinner();
  }

  pageChange(event) {
    this.ui.showSpinner();
    window.scroll({top: 0, behavior: 'smooth'});
    this.pageChanged.emit(event);
  }

  stringCompare(str1: string, str2: string, query: string) {
    let text = str1 || str2;

    if (text.toLowerCase().includes(query.toLowerCase())) return true;
    return false
  }

  dataChanged(event) {
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
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
        });
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
        });
    }
  }
}
