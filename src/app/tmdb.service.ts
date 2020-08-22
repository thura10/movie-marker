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

  getActorDetails(id: string) {
    return this.http.get<any>(`./api/tmdb/actor/${id}`)
  }
  getGenreItems(id: string, type: string, page: number) {
    return this.http.get<any>(`./api/tmdb/genre/${type}/${id}/${page}`)
  }
  getGenreList(type: string) {
    return this.http.get<any>(`./api/tmdb/genres/${type}/list`)
  } 

  getCalendarShows(startDate: string, endDate: string) {
    return this.http.get<any[]>(`./api/tmdb/calendar/tv/${startDate}/${endDate}`)
  }

  getPopularMovies(page?: number) {
    let no = page ? page : 1;
    return this.http.get<any>(`./api/tmdb/discover/popular/movie/${no}`)
  }
  getPopularTv(page?: number) {
    let no = page ? page : 1;
    return this.http.get<any>(`./api/tmdb/discover/popular/tv/${no}`)
  }
  getTrendingMovies(page?: number) {
    let no = page ? page : 1;
    return this.http.get<any>(`./api/tmdb/discover/trending/movie/${no}`)
  }
  getTrendingTv(page?: number) {
    let no = page ? page : 1;
    return this.http.get<any>(`./api/tmdb/discover/trending/tv/${no}`)
  }
  
  getRandomPoster() {
    return this.http.get<any>(`./api/tmdb/discover/poster`);
  }

  getEpisodeDetails(id: number, season: number, episode: number) {
    return this.http.get<any>(`./api/tmdb/tv/${id}/season/${season}/episode/${episode}`)
  }
}
