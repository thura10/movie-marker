import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private user: UserService, private router: Router) {}

  canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const permission = next.data['permission'];
    if (!this.user.getToken()) {
      return false;
    }
    else if (this.user.getToken() && permission.includes('user')) {
      return true;
    }
    else {
      return new Promise((resolve) => {
        this.user.checkAdmin().subscribe(res => {
          if (res && res.admin) {
            resolve(true);
          }
          resolve(false);
        })
      })
    }
  }
}
