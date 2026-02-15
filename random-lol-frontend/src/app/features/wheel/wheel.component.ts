import { Component, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';
import { ChampionsService } from '../../core/champions.service';
import { Champion } from '../../core/models/champion.model';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, NgSpinnerWheelComponent],
  templateUrl: './wheel.component.html',
})
export class WheelComponent {
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('spinner', { static: false }) spinnerRef?: NgSpinnerWheelComponent;

  private championsService = inject(ChampionsService);

  btnWidth = 60;
  width = 420;
  selectedRole: string | null = null;
  champions$: Observable<Champion[]> = of([]);
  loading = false;
  error: string | null = null;
  selectedChampion: string | null = null;

  // Definir le contenu de la roue
  roleItems: MenuItems[] = [
    { Id: '1', menuTitle: 'Top', backColor: '#8d0007', textColor: '#000' },
    { Id: '2', menuTitle: 'Jungle', backColor: '#229604', textColor: '#000' },
    { Id: '3', menuTitle: 'Mid', backColor: '#188a94', textColor: '#000' },
    { Id: '4', menuTitle: 'ADC', backColor: '#d7ff45', textColor: '#000' },
    { Id: '5', menuTitle: 'Support', backColor: '#d89400', textColor: '#000' },
  ];

  handleRoleSpinCompleted(item: MenuItems) {
    const role = item.menuTitle;
    this.selectedRole = role;
    this.selectedChampion = null;
    this.loading = true;
    this.error = null;

    this.champions$ = this.championsService.getChampionItemsByRole(role).pipe(
      tap(() => (this.loading = false)),

      catchError((err) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Failed to load champions';
        return of([]);
      }),
    );
    // Transform champions into wheel items for second wheel
    this.championWheelItems$ = this.champions$.pipe(
      map((champions) =>
        champions.map((champion) => ({
          Id: champion.name,
          menuTitle: champion.name,
          backColor: this.colorFromString(champion.name),
          textColor: '#000',
        })),
      ),
    );
  }

  //deuxieme wheel
  championWheelItems$ = this.champions$.pipe(
    map((champions) =>
      champions.map((c) => ({
        Id: c.name,
        menuTitle: c.name,
        backColor: this.colorFromString(c.name),
        textColor: '#000',
      })),
    ),
  );

  // couleur stable (pas random) basée sur le nom
  private colorFromString(input: string): string {
    let hash = 0;

    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }

    const hue = Math.abs(hash) % 360;

    return `hsl(${hue}, 75%, 45%)`;
  }

  handleChampionSpinCompleted(item: MenuItems) {
    this.selectedChampion = item.menuTitle;
  }
}
