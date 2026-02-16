import { Component, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';
import { ChampionsService } from '../../core/champions.service';
import { Champion } from '../../core/models/champion.model';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, NgSpinnerWheelComponent,MatIconModule],
  templateUrl: './wheel.component.html',
  styleUrl:'./wheel.component.css'
})
export class WheelComponent {
  // Platform identifier used to detect if code runs in browser
  private platformId = inject(PLATFORM_ID);

  // Boolean indicating if the component is running in browser
  isBrowser = isPlatformBrowser(this.platformId);

  // Reference to the first wheel component instance
  @ViewChild('roleSpinner', { static: false }) roleSpinnerRef?: NgSpinnerWheelComponent;
  @ViewChild('championSpinner', { static: false }) championSpinnerRef?: NgSpinnerWheelComponent;

  // Service used to retrieve champions from backend
  private championsService = inject(ChampionsService);

  // Width of the spin button inside the wheel
  btnWidth = 60;
  // Width of the wheel
  wheelWidth = 420;
  // Currently selected role from first wheel
  selectedRole: string | null = null;
  // Observable containing champions returned from backend
  champions$: Observable<Champion[]> = of([]);
  // Loading state while fetching champions
  loading = false;
  // Error message if backend request fails
  error: string | null = null;

  // Selected champion from second wheel
  selectedChampion: string | null = null;

  // Items displayed in the first wheel representing roles
  roleItems: MenuItems[] = [
    { Id: '1', menuTitle: 'Top', backColor: '#8d0007', textColor: '#000' },
    { Id: '2', menuTitle: 'Jungle', backColor: '#229604', textColor: '#000' },
    { Id: '3', menuTitle: 'Mid', backColor: '#188a94', textColor: '#000' },
    { Id: '4', menuTitle: 'ADC', backColor: '#d7ff45', textColor: '#000' },
    { Id: '5', menuTitle: 'Support', backColor: '#d89400', textColor: '#000' },
  ];

  // Called when the first wheel spin is completed
  handleRoleSpinCompleted(item: MenuItems) {
    // Extract selected role from wheel result
    const role = item.menuTitle;
    // Store selected role
    this.selectedRole = role;
    // Reset previously selected champion
    this.selectedChampion = null;
    // Enable loading state
    this.loading = true;
    // Reset previous error
    this.error = null;

    // Request champions corresponding to selected role
    this.champions$ = this.championsService
      .getChampionItemsByRole(role)
      .pipe(tap(() => (this.loading = false)));

    // Build second wheel items from champions list
    this.championWheelItems$ = this.champions$.pipe(
      map((champions) =>
        champions.map((champion) => ({
          Id: champion.name,
          menuTitle: champion.name,
          backColor: this.randomColor(),
          textColor: '#000',
        })),
      ),
    );
  }

  // Observable providing items for the second wheel
  championWheelItems$ = this.champions$.pipe(
    map((champions) =>
      champions.map((c) => ({
        Id: c.name,
        menuTitle: c.name,
        backColor: this.randomColor(),
        textColor: '#000',
      })),
    ),
  );

  stopWheelTime(spinner?: NgSpinnerWheelComponent) {
    if (!spinner) return;

    window.setTimeout(
      () => {
        spinner.stops();
      },
      this.randomInt(3000, 5000),
    );
  }

  // generate number between an interval
  private randomInt(min: number, max: number) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('wheel stopped in : ', randomNumber);
    return randomNumber;
  }

  // Generate a random color
  private randomColor(): string {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  // Called when the second wheel spin is completed
  handleChampionSpinCompleted(item: MenuItems) {
    this.selectedChampion = item.menuTitle;
  }
}
