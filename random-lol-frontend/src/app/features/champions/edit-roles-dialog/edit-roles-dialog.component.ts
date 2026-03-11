import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-roles-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
  ],
  templateUrl: './edit-roles-dialog.component.html',
  styleUrls: ['./edit-roles-dialog.component.css'],
})
export class EditRolesDialogComponent {
  form: FormGroup;

  roles = new FormControl('');
  rolesList: string[] = ['top', 'jungle', 'mid', 'adc', 'support'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; roles: string[] },
  ) {
    // pour s'assurer que les roles passer soit bien un array
    const initialRoles = Array.isArray(data.roles) ? data.roles : [];

    this.form = this.fb.group({
      roles: [initialRoles],
    });
  }

  onSubmit(): void {
    const roles = Array.isArray(this.form.value.roles)
      ? this.form.value.roles
      : [this.form.value.roles].filter((role) => role);
    console.log('Selected roles:', roles);
    this.dialogRef.close(roles);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
