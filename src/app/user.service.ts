import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  loginUser(username: string, password: string) {
    return this.http.post<any[]>('./api/user/login', {'username': username, 'password': password});
  }
  registerUser(username: string, email: string, password: string) {
    return this.http.post<any[]>('./api/user/register', {
      'username': username, 'email': email, 'password': password
    });
  }
  logout() {
    localStorage.clear();
    sessionStorage.clear();
  }
  authUser() {
    return this.http.post<any[]>('./api/user/auth', {"_id": this.getToken()})
  }

  setToken(_id: string) {
    localStorage.setItem("_id", _id)
  }
  private getToken() {
    return localStorage.getItem("_id")
  }
  setSession(username: string) {
    sessionStorage.setItem("session_user", username);
  }
  getSession() {
    return sessionStorage.getItem("session_user");
  }
}
