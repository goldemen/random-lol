import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ChampionsService } from '../../core/champions.service';
import { Champion } from '../../core/models/champion.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatTable } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-aleatoire',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTable,
    MatTableModule,
  ],
  templateUrl: './aleatoire.component.html',
  styleUrls: ['./aleatoire.component.css'],
})
export class AleatoireComponent {
  private championsService = inject(ChampionsService);
  randomChamp: Champion | undefined;
  rolesList: string[] = ['top', 'jungle', 'mid', 'adc', 'support'];
  roleForm: FormGroup;
  private cdr = inject(ChangeDetectorRef);

  championHistory: { name: string; roles: string[] }[] = [];
  displayedColumns: string[] = ['name', 'roles'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.roleForm = this.fb.group({
      roles: '', // Default to 'mid' or leave empty if you want no default
    });
  }

  getChampion(role?: string) {
    // console.log('role passed :', role);
    setTimeout(() => {
      this.championsService.getRandomChampion(role).subscribe((champ) => {
        this.randomChamp = champ;
        // console.log(champ);
        this.openSnackBar(champ.name + ' - ' + champ.roles);
        this.championHistory = [{ name: champ.name, roles: champ.roles }, ...this.championHistory];
        this.cdr.detectChanges();
      });
    });
  }

  onSubmit() {
    const selectedRole = this.roleForm.get('roles')?.value;
    // console.log('selected role : ', selectedRole);
    this.getChampion(selectedRole);
  }

  openSnackBar(message: string) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: message,
      duration: 60000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: 'snackBar',
    });
  }
}
