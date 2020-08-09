import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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
  getToken() {
    return localStorage.getItem("_id")
  }
  setSession(username: string) {
    sessionStorage.setItem("session_user", username);
  }
  getSession() {
    return sessionStorage.getItem("session_user");
  }

  getCollections() {
    return this.http.get<any[]>(`./api/user/collection/${this.getToken()}`)
  }
  getSharedCollections() {
    return this.http.get<any[]>(`./api/user/collection/${this.getToken()}/shared`)
  }
  newCollection(name: string) {
    return this.http.post<any>('./api/user/collection/new', {"name": name, "owner": this.getSession(), "ownerId": this.getToken()});
  }
  checkUser(username: string) {
    return this.http.get<any>(`./api/user/check/${username}`)
  }
  getCollectionPermission(_id: string) {
    return this.http.get<any>(`./api/user/collection/${_id}/permission`)
  }
  saveCollectionPermission(_id: string, permissions: string[]) {
    return this.http.put<any>(`./api/user/collection/${_id}/permission`, {'permissions': permissions, 'userId': this.getToken()});
  }
  deleteCollection(_id: string) {
    return this.http.delete<any>(`./api/user/collection/delete`, {params: new HttpParams().set("userId", this.getToken()).set("_id", _id)})
  }
  editCollection(_id: string, name: string) {
    return this.http.put<any>(`./api/user/collection/edit`, {'_id': _id, 'userId': this.getToken(), 'name': name});
  }
  getCollection(_id: string) {
    return this.http.get<any>('./api/user/collection', {params: new HttpParams().set("userId", this.getToken()).set("_id", _id)})
  }

  addCollectionItem(type: string, itemId: string, poster: string, name: string, collectionId: string) {
    return this.http.post<any>(`./api/user/collection/add`, {
      '_id': collectionId,
      'userId': this.getToken(),
      'itemId': itemId,
      'name': name,
      'type': type,
      'poster': poster
    });
  }
  removeCollectionItem(_id: string, itemId: string, type: string) {
    return this.http.put<any>(`./api/user/collection/remove`, {'_id': _id, 'itemId': itemId, 'type': type, 'userId': this.getToken()});
  }
}
