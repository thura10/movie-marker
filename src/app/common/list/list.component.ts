import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { trigger, transition, style, animate, query, stagger, animateChild } from '@angular/animations';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
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
export class ListComponent implements OnInit, OnChanges {

  constructor(private userService: UserService) { }

  @Input() list: any[] = [];
  @Input() query: string = '';
  page: number = 1;

  filteredList: any[] = [];

  watched: any[] = [];
  favourite: any[] = [];

  ngOnInit() {
    this.dataChanged();
  }
  ngOnChanges() {
    if (this.query) {
      this.filteredList = this.list.filter(item => this.stringCompare(item.name, item.title, this.query));
      return;
    }
    this.filteredList = this.list;
  }
  pageChange(event) {
    window.scroll({top: 0, behavior: 'smooth'});
  }

  stringCompare(str1: string, str2: string, query: string) {
    let text = str1 || str2;

    if (text.toLowerCase().includes(query.toLowerCase())) return true;
    return false
  }

  dataChanged() {
    this.userService.getWatched().subscribe(res => {
      this.watched = res;
    })
    this.userService.getFavourite().subscribe(res => {
      this.favourite = res;
    })
  }

}
