import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsService } from '../../core/champions.service';
import { Observable } from 'rxjs';
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
  imports:[CommonModule, MatTableModule],
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.css'],
})

export class ChampionsComponent {
  private championsService = inject(ChampionsService);

  displayedColumns: Array<keyof ChampionRow | 'rolesText'> = ['name', 'rolesText'];

  rows$ = this.championsService.getChampions().pipe(
    map((data: ChampionsResponse) =>
      Object.entries(data).map(([name, roles]) => ({ name, roles }))
    ),
    // optional: sort by name
    map(rows => rows.sort((a, b) => a.name.localeCompare(b.name)))
  );

  rolesText(row: ChampionRow): string {
    return row.roles?.join(', ') ?? '';
  }
}
