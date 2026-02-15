import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Champion, ChampionsByRole } from './models/champion.model';

@Injectable({
  providedIn: 'root',
})
export class ChampionsService {
  private http = inject(HttpClient);

  getChampions(): Observable<any> {
    return this.http.get<any>('/api/champions');
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
