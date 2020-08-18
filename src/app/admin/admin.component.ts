import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private userService: UserService, private ui: UiService) { }

  users: any[];
  myRole: string;

  ngOnInit() {
    this.ui.showSpinner();
    this.userService.getUsers().subscribe(res => {
      this.users = res.sort((a, b) => {
        let aRole = this.getRole(a.role);
        let bRole = this.getRole(b.role);
        if (aRole == 'owner' && (bRole == 'admin' || bRole == 'user')) return -1;
        if (aRole == 'admin' && bRole == 'user') return -1;
        if (aRole == 'admin' && bRole == 'owner') return 1;
        if (aRole == 'user') return 1;
      });

      this.myRole = this.getRole(this.users.find((user) => user._id == this.userService.getToken()).role);
      this.ui.stopSpinner();
    })
  }
  getRole(role: string[]) {
    if (role && role.includes('owner')) {
      return 'owner'
    }
    else if (role && role.includes('admin')) {
      return 'admin'
    }
    return 'user'
  }
  determineDropdown(user: any) {
    let role = this.getRole(user.role);
    if (role === 'owner') return false;
    if (role === 'admin') {
      if (this.myRole !== 'owner') return false;
    }
    return true;
  }

  promoteUser(user: any) {
    if (this.getRole(user.role) === 'user') {
      this.userService.promoteUser(user._id).subscribe(res => {
        this.ngOnInit();
      })
    } 
  }
  demoteUser(user: any) {
    if (this.getRole(user.role) === 'admin' && this.myRole === 'owner') {
      this.userService.demoteUser(user._id).subscribe(res => {
        this.ngOnInit();
      })
    }
  }
  deleteUser(user: any) {
    if (this.getRole(user.role) === 'user') {
      this.userService.deleteUser(user._id).subscribe(res => {
        this.ngOnInit();
      })
    }
  }

}
