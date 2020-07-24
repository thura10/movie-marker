import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  constructor(private http: HttpClient) { }

  search(query: string) {
    return this.http.get<any[]>(`./api/search/${query}`)
  }
  getMovieDetails(id: string) {
    return this.http.get<any[]>(`./api/movie/${id}`)
  }
  getCollection(id: string) {
    return this.http.get<any[]>(`./api/collection/${id}`)
  }
  getTvDetails(id: string) {
    return this.http.get<any[]>(`./api/tv/${id}`)  
  }
}
