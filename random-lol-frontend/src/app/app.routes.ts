import { Routes } from '@angular/router';
import { ChampionsComponent } from './features/champions/champions.component';
import { HomeComponent } from './features/home/home.component';
import { WheelComponent } from './features/wheel/wheel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'champions', component: ChampionsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'wheel', component: WheelComponent },
  { path: '**', redirectTo: 'home' }
];
