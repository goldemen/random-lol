import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsService } from '../../core/champions.service';
import { BehaviorSubject, combineLatest, Observable, tap } from 'rxjs';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { EditRolesDialogComponent } from './edit-roles-dialog/edit-roles-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

//models
import { ChampionRow } from '../../core/models/champion.model';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogState } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

type ChampionsResponse = Record<string, string[]>;

@Component({
  selector: 'app-champions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.css'],
})

export class ChampionsComponent {
  private championsService = inject(ChampionsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  private filtreSubject = new BehaviorSubject<string>('');
  private filtre$ = this.filtreSubject.asObservable();

  displayedColumns: Array<keyof ChampionRow | 'roles' > = ['name', 'roles'];


  // combineLatest permet de combiner plusieurs observables en un (ici championsService et filtre$)
  // map transform les données d'un array
  // row$ est un observable avec des données filtré et trier
  rows$ = combineLatest([
    this.championsService.getChampions(),
    this.filtre$
  ]).pipe(
    map(([rows, filterValue]) =>
      rows
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(row => row.name.toLowerCase().includes(filterValue.toLowerCase()))
    )
  );

  // transforme l'array en un string
  rolesText(row: ChampionRow): string {
    return Array.isArray(row.roles) ? row.roles.join(', ') : '';
  }

  // pour modifier les roles
  selectedChampion: ChampionRow | null = null;
  newRoles: string = '';


  //ouvre le dialog (edit-roles-dialog)
  openEditDialog(champion: ChampionRow): void {
    console.log('rows : ', this.rows$);
    const dialogRef = this.dialog.open(EditRolesDialogComponent, {
      data: { name: champion.name, roles: champion.roles },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateRoles(champion.name, result);
      }
    });
  }

  // apres reception des données utilise le service pour update les données
  updateRoles(name: string, roles: string[]): void {
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

  // Utilisé par le Input au dessus du tableau, permet de filtrer les données affichées
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtreSubject.next(filterValue);
  }
}
