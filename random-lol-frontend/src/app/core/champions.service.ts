import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Champion, ChampionsByRole, ChampionRow } from './models/champion.model';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ChampionsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // check

  getChampions(): Observable<ChampionRow[]> {
    const apiUrl = isPlatformServer(this.platformId)
      ? 'http://localhost:3000/api/champions'
      : '/api/champions';
    return this.http.get<ChampionRow[]>(apiUrl);
  }

  getChampionsByRole(role: string): Observable<ChampionsByRole> {
    const cleanedRole = role?.trim().toLowerCase();
    const params = new HttpParams().set('role', cleanedRole);

    return this.http
      .get<ChampionsByRole>('/api/championsByRole', { params })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // pour la 2e wheel
  getChampionItemsByRole(role: string): Observable<Champion[]> {
    return this.getChampionsByRole(role).pipe(map((res) => res.champions));
  }
  // constructor() {}
}
