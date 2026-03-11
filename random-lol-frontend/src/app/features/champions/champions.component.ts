import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsService } from '../../core/champions.service';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { EditRolesDialogComponent } from './edit-roles-dialog/edit-roles-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

type ChampionsResponse = Record<string, string[]>;

export interface ChampionRow {
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-champions',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule],
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.css'],
})
export class ChampionsComponent {
  private championsService = inject(ChampionsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: Array<keyof ChampionRow | 'rolesText' | 'buttons'> = [
    'name',
    'rolesText',
    'buttons',
  ];

  rows$ = this.championsService.getChampions().pipe(
    // tap((data) => console.log('Data received:', data)),
    map((rows) => rows.sort((a, b) => a.name.localeCompare(b.name))),
  );

  rolesText(row: ChampionRow): string {
    return Array.isArray(row.roles) ? row.roles.join(', ') : '';
  }

  // pour modifier les roles
  selectedChampion: ChampionRow | null = null;
  newRoles: string = '';

  openEditDialog(champion: ChampionRow): void {
    const dialogRef = this.dialog.open(EditRolesDialogComponent, {
      data: { name: champion.name, roles: champion.roles },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateRoles(champion.name, result);
      }
    });
  }

  updateRoles(name: string, roles: string[]): void {
    // console.log('name : ',name, ' roles : ',roles);
    this.championsService.putChampionRoles(name, roles).subscribe({
      next: (updatedChampion) => {
        alert(`Rôles mis à jour pour ${updatedChampion.name}`);
        this.rows$ = this.championsService
          .getChampions()
          .pipe(map((rows) => rows.sort((a, b) => a.name.localeCompare(b.name))));
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        alert('Erreur lors de la mise à jour des rôles.');
      },
    });
  }
}
