import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-node-dialog',
  templateUrl: './edit-node-dialog.component.html',
  styleUrls: []
})
export class EditNodeDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditNodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: EditNodeDialogData) {
    }

  ngOnInit() {
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  onOkClick() {
    this.dialogRef.close(this.node);
  }

  @HostListener('document:keyup', ['$event'])
  private handleKeyUp(event: KeyboardEvent): void {
      switch (event.key) {
          case 'Enter':
              this.onOkClick();
              break;
          default:
              break;
      }
  }
}

export class EditNodeDialogData {
  label: string;
  id: string | number;
}
