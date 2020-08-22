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
    return new Promise((resolve) => {
      if (!this.user.getToken()) {
        this.router.navigateByUrl('/')
        resolve(false);
      }
      else if (permission.includes('user')) {
        resolve(true);
      }
      else {
        this.user.checkAdmin().subscribe(res => {
          if (res && res.admin) {
            resolve(true);
          }
          else {
            this.router.navigateByUrl('/')
            resolve(false);
          }
        })
      }
    })
  }
}
