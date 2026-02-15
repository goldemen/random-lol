import { Component, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';
import { ChampionsService } from '../../core/champions.service';
import { Champion } from '../../core/models/champion.model';
import { catchError, Observable, of, tap } from 'rxjs';

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

  // Definir le contenu de la roue
  roleItems: MenuItems[] = [
    { Id: '1', menuTitle: 'Top', backColor: '#8d0007', textColor: '#000' },
    { Id: '2', menuTitle: 'Jungle', backColor: '#229604', textColor: '#000' },
    { Id: '3', menuTitle: 'Mid', backColor: '#188a94', textColor: '#000' },
    { Id: '4', menuTitle: 'ADC', backColor: '#d7ff45', textColor: '#000' },
    { Id: '5', menuTitle: 'Support', backColor: '#d89400', textColor: '#000' },
  ];

  // recuperation du resultat de la premiere wheel pour afficher la liste des champions correspondants au role
  champions$: Observable<Champion[]> = of([]);
  loading = false;
  error: string | null = null;

  handleRoleSpinCompleted(item: MenuItems) {
    const role = item.menuTitle.toString().trim().toLowerCase();

    this.selectedRole = role;
    this.loading = true;
    this.error = null;

    this.champions$ = this.championsService.getChampionItemsByRole(role).pipe(
      tap(() => (this.loading = false)),
      catchError((err) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Failed to load champions.';
        return of([]);
      }),
    );
    console.log(this.champions$);
  }
}
