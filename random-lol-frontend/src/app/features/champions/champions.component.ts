import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsService } from '../../core/champions.service';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs';

// Angular Material
import { MatTableModule } from '@angular/material/table';

type ChampionsResponse = Record<string, string[]>;

export interface ChampionRow {
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-champions',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.css'],
})
export class ChampionsComponent {
  private championsService = inject(ChampionsService);

  displayedColumns: Array<keyof ChampionRow | 'rolesText'> = ['name', 'rolesText'];

  rows$ = this.championsService.getChampions().pipe(
    tap((data) => console.log('Data received:', data)),
    map((rows) => rows.sort((a, b) => a.name.localeCompare(b.name))),
  );

  rolesText(row: ChampionRow): string {
    return Array.isArray(row.roles) ? row.roles.join(', ') : '';
  }
}
