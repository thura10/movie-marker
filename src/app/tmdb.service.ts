import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  constructor(private http: HttpClient) { }

  search(query: string) {
    return this.http.get<any[]>(`./api/tmdb/search/${query}`)
  }
  getMovieDetails(id: string) {
    return this.http.get<any[]>(`./api/tmdb/movie/${id}`)
  }
  getCollection(id: string) {
    return this.http.get<any[]>(`./api/tmdb/collection/${id}`)
  }
  getTvDetails(id: string) {
    return this.http.get<any[]>(`./api/tmdb/tv/${id}`)  
  }
  getSeasonDetails(tvId: string, seasonNumber: string) {
    return this.http.get<any[]>(`./api/tmdb/tv/${tvId}/season/${seasonNumber}`)
  }
}
