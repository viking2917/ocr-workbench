import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonList, IonItem, IonSelect, IonSelectOption,  } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import { newspaper } from 'ionicons/icons';

import { OcrService } from '../services/ocr.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonSelect, IonSelectOption, IonIcon,
    FormsModule, NgFor]
})
export class SettingsPage {
  ocrStrategies: string[] = [''];

  constructor(public ocrService: OcrService) {
    addIcons({ newspaper });
    this.ocrStrategies = this.ocrService.strategies;
  }

  handleChange(event: CustomEvent) {
    this.ocrService.setStorageStrategy(event.detail.value, true);
  }
}
