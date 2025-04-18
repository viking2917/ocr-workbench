import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonHeader, IonToolbar, IonIcon, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-find-replace-modal',
  templateUrl: './find-replace-modal.component.html',
  styleUrls: ['./find-replace-modal.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons
  ]
})
export class FindReplaceModalComponent {
  @ViewChild(IonModal) modal!: IonModal;
  @Output() findReplace = new EventEmitter<{find: string, replace: string}>();
  @Output() dismiss = new EventEmitter<void>();

  findText: string = '';
  replaceText: string = '';
  isOpen: boolean = true;

  constructor() {
    addIcons({ closeOutline });
  }

  onFindReplace() {
    this.findReplace.emit({
      find: this.findText,
      replace: this.replaceText
    });
    this.isOpen = false;
    this.modal.dismiss(null, 'cancel');
  }

  onDismiss() {
    this.isOpen = false;
    this.modal.dismiss(null, 'cancel');
    this.dismiss.emit();
  }
} 